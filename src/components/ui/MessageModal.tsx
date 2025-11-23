import type { ReactNode } from "react";
import Modal from "./Modal";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

/**
 * 메시지 모달 버튼 인터페이스
 */
interface MessageModalButton {
  /** 버튼 텍스트 */
  label: string;
  /** 버튼 클릭 핸들러 */
  onClick: () => void;
  /** 버튼 스타일 변형 */
  variant?: "primary" | "secondary" | "danger";
}

/**
 * 메시지 모달 컴포넌트의 Props
 *
 * @example
 * ```tsx
 * <MessageModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="알림"
 *   message="작업이 완료되었습니다."
 *   type="success"
 *   buttons={[{ label: "확인", onClick: handleClose, variant: "primary" }]}
 * />
 * ```
 */
interface MessageModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 제목 (선택사항) */
  title?: string;
  /** 메시지 내용 */
  message: string | ReactNode;
  /** 메시지 타입 (아이콘 및 색상 결정) */
  type?: "success" | "error" | "warning" | "info";
  /** 커스텀 버튼 배열 */
  buttons?: MessageModalButton[];
  /** 커스텀 아이콘 (선택사항, type이 있으면 무시됨) */
  icon?: ReactNode;
}

const typeConfig = {
  success: {
    icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
    titleColor: "text-green-800",
    bgColor: "bg-white",
  },
  error: {
    icon: <XCircle className="w-12 h-12 text-red-500" />,
    titleColor: "text-red-800",
    bgColor: "bg-white",
  },
  warning: {
    icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    titleColor: "text-yellow-800",
    bgColor: "bg-white",
  },
  info: {
    icon: <Info className="w-12 h-12 text-blue-500" />,
    titleColor: "text-blue-800",
    bgColor: "bg-white",
  },
};

const buttonVariants = {
  primary: "bg-[#D2EDE4] hover:bg-[#79CCB1] text-[#2D5945]",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  danger: "bg-red-100 hover:bg-red-200 text-red-700",
};

const MessageModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttons,
  icon,
}: MessageModalProps) => {
  const config = typeConfig[type];

  // 기본 버튼 설정
  const defaultButtons: MessageModalButton[] = [
    { label: "확인", onClick: onClose, variant: "primary" },
  ];

  const modalButtons = buttons || defaultButtons;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" closeOnBackdrop={false}>
      <div className={`text-center p-6 ${config.bgColor} rounded-lg`}>
        {/* 아이콘 */}
        <div className="flex justify-center mb-4">{icon || config.icon}</div>

        {/* 제목 */}
        {title && <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>{title}</h3>}

        {/* 메시지 */}
        <div className="text-gray-700 mb-6">
          {typeof message === "string" ? <p className="whitespace-pre-wrap">{message}</p> : message}
        </div>

        {/* 버튼들 */}
        <div
          className={`flex gap-3 ${modalButtons.length === 1 ? "justify-center" : "justify-center"}`}
        >
          {modalButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                modalButtons.length === 1 ? "w-full" : "flex-1 max-w-[150px]"
              } ${buttonVariants[button.variant || "primary"]}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
