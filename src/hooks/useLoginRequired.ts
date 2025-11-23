import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageModal } from "./useMessageModal";

/**
 * 로그인이 필요한 작업을 수행하기 전에 인증 상태를 확인하는 훅
 *
 * @example
 * ```tsx
 * const { requireLogin } = useLoginRequired();
 *
 * const handleLike = () => {
 *   if (!requireLogin()) return;
 *   // 좋아요 로직 실행
 * };
 * ```
 */
export const useLoginRequired = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { showWarning, hideModal } = useMessageModal();

  /**
   * 로그인 여부를 확인하고, 로그인하지 않았으면 안내 모달을 표시합니다.
   *
   * @param message - 모달에 표시할 메시지 (기본값: "이 기능을 사용하시려면 로그인해주세요")
   * @param title - 모달 제목 (기본값: "로그인이 필요합니다")
   * @returns 로그인 상태 (true: 로그인됨, false: 로그인 안됨)
   */
  const requireLogin = useCallback(
    (
      message: string = "이 기능을 사용하시려면 로그인해주세요",
      title: string = "로그인이 필요합니다",
    ): boolean => {
      if (!isAuthenticated) {
        showWarning(message, title, [
          {
            label: "취소",
            variant: "secondary",
            onClick: hideModal,
          },
          {
            label: "로그인하기",
            variant: "primary",
            onClick: () => {
              hideModal();
              navigate("/login");
            },
          },
        ]);
        return false;
      }
      return true;
    },
    [isAuthenticated, showWarning, hideModal, navigate],
  );

  return { requireLogin, isAuthenticated };
};
