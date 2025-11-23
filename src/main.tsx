import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { extractAndStoreAccessToken } from "./apis/axios";

/**
 * React Query 클라이언트 설정 (성능 최적화)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 데이터를 신선한 상태로 유지 (불필요한 재요청 방지)
      staleTime: 1000 * 60 * 5,
      // 30분간 캐시 유지
      gcTime: 1000 * 60 * 30,
      // 윈도우 포커스 시 자동 재요청 (실시간성 유지)
      refetchOnWindowFocus: true,
      // 마운트 시 재요청 (최신 데이터 보장)
      refetchOnMount: true,
      // 재연결 시 재요청
      refetchOnReconnect: true,
      // 3번까지 재시도
      retry: 1,
      // 재시도 딜레이
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // mutation 재시도 안 함 (사용자 액션이므로)
      retry: false,
    },
  },
});

// 앱 시작 시 URL에서 access_token 추출
extractAndStoreAccessToken();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
