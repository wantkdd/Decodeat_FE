import { memo } from "react";
import leftIcon from "../../assets/icon/ic_Left_28.svg";
import leftIconDisabled from "../../assets/icon/ic_Left_disabled_28.svg";
import rightIcon from "../../assets/icon/ic_Right_28.svg";
import rightIconDisabled from "../../assets/icon/ic_Right_disabled_28.svg";

/**
 * 페이지네이션 컴포넌트의 Props
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
interface PaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 시 호출되는 콜백 함수 */
  onPageChange: (page: number) => void;
}

/**
 * 페이지네이션 컴포넌트 (React.memo로 최적화)
 */
const Pagination = memo(({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // 페이지 이동 시 1 ~ totalPages 범위로 클램프
  const goTo = (p: number) => {
    const clamped = Math.min(Math.max(1, p), Math.max(1, totalPages || 1));
    if (clamped !== currentPage) onPageChange(clamped);
  };

  // 페이지 번호 목록 (최대 5개, 실제 totalPages보다 넘지 않음)
  const getPageNumbers = () => {
    const maxButtons = 5;
    if (!totalPages || totalPages <= 0) return [1];

    let start = Math.max(1, currentPage - 2);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div className="flex items-center gap-4">
      {/* 이전 */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={isFirst}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-[#D2EDE4] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="이전 페이지"
      >
        <img src={isFirst ? leftIconDisabled : leftIcon} alt="이전" />
      </button>

      {/* 페이지 번호들 */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-xl font-semibold cursor-pointer transition-colors ${
            p === currentPage
              ? "bg-[#2D5945] text-white"
              : "bg-[#D2EDE4] text-[#2D5945] hover:bg-[#79CCB1]"
          }`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {/* 다음 */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={isLast}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-[#D2EDE4] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="다음 페이지"
      >
        <img src={isLast ? rightIconDisabled : rightIcon} alt="다음" />
      </button>
    </div>
  );
});

Pagination.displayName = "Pagination";

export default Pagination;
