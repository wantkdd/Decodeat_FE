import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { getProductDetail } from "../apis/productDetail";
import { createCalorieInfo } from "../utils/nutritionUtils";
import NutritionChart from "../components/detail/NutritionChart";
import DetailedNutrients from "../components/detail/DetailedNutrients";
import RecommendedProducts from "../components/detail/RecommendedProducts";
import { useImageReport } from "../hooks/useReport";
import { useMessageModal } from "../hooks/useMessageModal";
import { useLoginRequired } from "../hooks/useLoginRequired";
import { useLikeMutation } from "../hooks/useLike";
import MessageModal from "../components/ui/MessageModal";
import warnIcon from "../assets/icon/warn.svg";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 로그인 체크 훅
  const { requireLogin, isAuthenticated } = useLoginRequired();

  // 이미지 신고 훅
  const imageReportMutation = useImageReport();

  // 좋아요 훅
  const likeMutation = useLikeMutation(Number(id!));

  // 메시지 모달 훅
  const { modalState, showSuccess, showError, showConfirm, hideModal } = useMessageModal();
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(Number(id!)),
    enabled: !!id,
  });

  const product = response?.result;

  // 이미지 배열(제품사진->영양정보사진)
  const getAllImages = () => {
    if (!product) return [];
    const images = [];
    if (product.productImage) {
      images.push(product.productImage);
    }
    if (product.imageUrl && product.imageUrl.length > 0) {
      images.push(...product.imageUrl);
    }
    return images;
  };

  const allImages = getAllImages();

  const handleNext = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const handlePrev = () => {
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  // 이미지 신고 핸들러
  const handleImageReport = () => {
    if (!product) return;

    // 로그인 확인
    if (!requireLogin("신고 기능을 이용하시려면 로그인해 주세요.")) {
      return;
    }

    // 제품 사진이 없는 경우 오류 메시지
    if (!product.productImage) {
      showError("제품 사진이 없습니다.", "신고 실패");
      return;
    }

    showConfirm(
      "정말 신고하시겠습니까?",
      async () => {
        try {
          await imageReportMutation.mutateAsync({
            productId: product.productId,
            imageUrl: product.productImage, // 항상 제품 사진을 신고
          });

          showSuccess("이미지 신고가 접수되었습니다.", "신고 완료");
        } catch (error: unknown) {
          console.error("이미지 신고 실패:", error);

          // 에러 응답에서 메시지 추출
          let errorMessage = "신고 접수에 실패했습니다. 다시 시도해주세요.";
          if (error && typeof error === "object" && "response" in error) {
            const response = (error as { response?: { data?: { message?: string } } }).response;
            if (response?.data?.message) {
              errorMessage = response.data.message;
            }
          }
          showError(errorMessage, "신고 실패");
        }
      },
      "잘못된 이미지 신고",
      "신고하기",
      "취소",
    );
  };

  // 칼로리 정보
  const calorieInfo = createCalorieInfo(product!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error ? error.message : "상품을 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-5 py-5 mt-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* 사진 영역 */}
          <div className="space-y-4 mx-7 my-7">
            {/* 신고 버튼 - 이미지 위쪽 */}
            <div className="flex justify-end mb-2">
              <button
                className="flex items-center space-x-1 cursor-pointer"
                onClick={handleImageReport}
                disabled={imageReportMutation.isPending}
              >
                <img src={warnIcon} alt="경고" className="w-4 h-4" />
                <p className="text-sm text-gray-500 m-0">
                  {imageReportMutation.isPending ? "신고 중..." : "잘못된 이미지 신고"}
                </p>
              </button>
            </div>

            {/* 초기 이미지 */}
            <div className="relative bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
              <img
                src={allImages[currentImageIndex] || "/placeholder-image.jpg"}
                alt={`상품 이미지 ${currentImageIndex + 1}`}
                className="w-full h-full object-contain rounded"
              />{" "}
              {/* 이미지 이동 버튼 */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 
                             bg-white/70 border border-gray-300 
                             rounded-full w-8 h-8 
                             flex items-center justify-center 
                             hover:bg-white transition cursor-pointer"
                  >
                    {"<"}
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 
                             bg-white/70 border border-gray-300 
                             rounded-full w-8 h-8 
                             flex items-center justify-center 
                             hover:bg-white transition cursor-pointer"
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 상품 디테일 */}
          <div className="space-y-2">
            {/* 회사명 */}
            {product?.manufacturer && (
              <div className="flex items-center mt-6">
                <span className="text-xl font-semibold text-[#2D5945]">{product.manufacturer}</span>
              </div>
            )}

            {/* 상품명 및 칼로리 */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between mb-4">
                {product?.name && (
                  <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
                )}
                {calorieInfo && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {calorieInfo.value} {calorieInfo.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-full h-2 rounded mb-6" style={{ backgroundColor: "#dfe9df" }} />

            {/* 좋아요 버튼 */}
            <div className="flex justify-start mb-4">
              <button
                onClick={() => {
                  if (!requireLogin("좋아요 기능을 이용하시려면 로그인해 주세요.")) {
                    return;
                  }
                  likeMutation.mutate();
                }}
                disabled={likeMutation.isPending}
                className="flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    product.liked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
                <span className={`text-sm font-medium`}>좋아요</span>
              </button>
            </div>

            {/* 영양정보 차트 */}
            <NutritionChart
              product={product}
              isAuthenticated={isAuthenticated}
              onLoginRequired={() => requireLogin("영양정보 비교 기능을 이용하시려면 로그인해 주세요.")}
            />
          </div>
        </div>

        {/* 세부 영양소 섹션 */}
        <DetailedNutrients product={product} />

        {/* 추천 상품 섹션 */}
        <RecommendedProducts productId={product.productId} />
      </div>

      {/* 메시지 모달 */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        buttons={modalState.buttons}
        icon={modalState.icon}
      />
    </div>
  );
};

export default ProductDetailPage;
