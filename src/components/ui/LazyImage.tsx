import { memo } from "react";
import { useInView } from "react-intersection-observer";

/**
 * 레이지 로딩 이미지 컴포넌트 Props
 */
interface LazyImageProps {
  /** 이미지 소스 URL */
  src: string;
  /** 대체 텍스트 */
  alt: string;
  /** CSS 클래스명 */
  className?: string;
  /** 플레이스홀더 이미지 (선택사항) */
  placeholder?: string;
  /** 로딩 중 표시할 내용 */
  loadingComponent?: React.ReactNode;
}

/**
 * Intersection Observer를 사용한 레이지 로딩 이미지 컴포넌트
 *
 * 뷰포트에 진입할 때만 이미지를 로드하여 초기 페이지 로딩 속도를 개선합니다.
 *
 * @example
 * ```tsx
 * <LazyImage
 *   src="/product.jpg"
 *   alt="제품 이미지"
 *   className="w-full h-auto"
 * />
 * ```
 */
const LazyImage = memo(({
  src,
  alt,
  className = "",
  placeholder,
  loadingComponent
}: LazyImageProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // 한 번만 로드
    threshold: 0.1, // 10% 보이면 트리거
    rootMargin: "50px", // 50px 전에 미리 로드
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
        />
      ) : (
        loadingComponent || (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            {placeholder && <img src={placeholder} alt="" className="opacity-50" />}
          </div>
        )
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;
