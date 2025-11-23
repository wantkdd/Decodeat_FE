import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * API 에러 로깅 헬퍼 함수
 */
const logError = (message: string, error: unknown) => {
  if (import.meta.env.MODE === "development") {
    console.error(`[API Error] ${message}:`, error);
  }
};

export const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Bearer 헤더 방식 사용
});

/**
 * 토큰 갱신 대기열 아이템 타입
 */
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

/**
 * 확장된 Axios 요청 설정 (재시도 플래그 포함)
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 토큰 갱신 중복 방지를 위한 플래그
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
};

// URL에서 access_token 가져와서 저장하는 함수
export const extractAndStoreAccessToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get("access_token");

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);

    // URL에서 토큰 파라미터 제거 (보안상)
    urlParams.delete("access_token");
    const newUrl =
      window.location.pathname + (urlParams.toString() ? "?" + urlParams.toString() : "");
    window.history.replaceState({}, "", newUrl);

    return accessToken;
  }

  return localStorage.getItem("access_token");
};

// 요청 인터셉터 - Authorization 헤더에 토큰 자동 추가
API.interceptors.request.use(
  (config) => {
    const accessToken = extractAndStoreAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (토큰 갱신 및 에러 처리)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // 에러 로깅
    if (error.response) {
      logError(
        `HTTP ${error.response.status} - ${error.config?.url}`,
        error.response.data,
      );
    } else if (error.request) {
      logError("네트워크 에러 - 응답 없음", error.message);
    } else {
      logError("요청 설정 에러", error.message);
    }

    // 로그인 페이지에서는 토큰 갱신 시도하지 않음
    if (window.location.pathname === "/login") {
      return Promise.reject(error);
    }

    // 등록 페이지에서는 바로 로그인 모달 띄우기 (토큰 갱신 시도 안함)
    if (window.location.pathname === "/enroll" && error.response?.status === 401) {
      useAuthStore.getState().setShowLoginModal(true);
      return Promise.reject(error);
    }

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중인 경우 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => API(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/token`,
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );

        if (response.data.isSuccess) {
          const newAccessToken = response.data.result;
          localStorage.setItem("access_token", newAccessToken);

          processQueue(null);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } else {
          throw new Error("토큰 갱신 실패");
        }
      } catch (refreshError) {
        processQueue(refreshError);

        if (refreshError instanceof AxiosError && refreshError.response?.status === 401) {
          useAuthStore.getState().setShowLoginModal(true);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
