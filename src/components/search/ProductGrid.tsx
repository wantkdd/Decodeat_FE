import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { useLatestProductsList } from "../../hooks/useProductList";
import { useEffect, useCallback, memo } from "react";
import ProductGridSkeleton from "./ProductGridSkeleton";
import Skeleton from "../ui/Skeleton";
import { useLikeMutation } from "../../hooks/useLike";
import type { LatestProduct } from "../../types/productList";

/**
 * 개별 제품 카드 컴포넌트 (React.memo로 최적화)
 *
 * 불필요한 리렌더링을 방지하여 성능을 개선합니다.
 */
const ProductCard = memo(({
  product,
  displayImage,
  onProductClick,
}: {
  product: LatestProduct;
  displayImage: string;
  onProductClick: (productId: number) => void;
}) => {
  const likeMutation = useLikeMutation(product.productId);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    likeMutation.mutate();
  };

  return (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onProductClick(product.productId)}
    >
      {/* 제품 이미지 */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={displayImage}
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/decodeatLogo.ico"; // 기본 이미지로 대체
          }}
        />
      </div>

      {/* 제품 정보 */}
      <div className="p-4">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 pr-2">
              {product.productName}
            </h3>
            {/* 좋아요 버튼 - 분석완료인 경우에만 표시 */}
            {product.decodeStatus === "COMPLETED" && (
              <button
                onClick={handleLikeClick}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                disabled={likeMutation.isPending}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    product.liked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">{product.manufacturer}</p>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

const ProductGrid = () => {
  const navigate = useNavigate();
  const { products, isLoading, error, hasNextPage, fetchNextPage, isEmpty, isFetchingNextPage } =
    useLatestProductsList();

  // 제품 클릭 핸들러 (useCallback으로 메모이제이션)
  const handleProductClick = useCallback(
    (productId: number) => {
      navigate(`/detail/${productId}`);
    },
    [navigate]
  );

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
      hasNextPage &&
      !isLoading &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 에러 상태
  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <ShoppingCart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-500">
            제품을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 첫 로딩 시 스켈레톤 표시
  if (isLoading && products.length === 0) {
    return <ProductGridSkeleton count={10} />;
  }

  return (
    <div className="w-full">
      {/* 추천상품 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#2D5945] mb-2">최신 상품</h2>
          <p className="text-sm text-gray-600">새로 등록된 제품들을 확인해보세요</p>
        </div>
      </div>

      {/* 제품 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product) => {
          // 표시할 이미지 결정 (제품 사진 우선, 없으면 기본 이미지)
          const displayImage = product.productImage || "/decodeatLogo.ico";

          return (
            <ProductCard
              key={`product-${product.productId}`}
              product={product}
              displayImage={displayImage}
              onProductClick={handleProductClick}
            />
          );
        })}
      </div>

      {/* 추가 로딩 시 스켈레톤 */}
      {isFetchingNextPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`loading-skeleton-${index}`}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* 이미지 스켈레톤 */}
              <div className="aspect-square bg-gray-100">
                <Skeleton className="w-full h-full" />
              </div>

              {/* 제품 정보 스켈레톤 */}
              <div className="p-4">
                <div className="mb-2">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 기본 로딩 상태 (폴백) */}
      {isLoading && !isFetchingNextPage && products.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5945]"></div>
          <span className="ml-2 text-gray-600">제품을 불러오는 중...</span>
        </div>
      )}

      {/* 더 이상 로드할 제품이 없을 때 */}
      {!hasNextPage && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">모든 제품을 확인했습니다.</p>
        </div>
      )}

      {/* 제품이 없을 때 */}
      {isEmpty && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ShoppingCart className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 제품이 없습니다</h3>
          <p className="text-gray-500">새로운 제품이 등록되면 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
