import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import UploadSlot from "../components/enroll/UploadSlot";
import { useEnroll } from "../hooks/useEnroll";
import { useMessageModal } from "../hooks/useMessageModal";
import MessageModal from "../components/ui/MessageModal";
import { useAuthStore } from "../store/useAuthStore";
import { useLoginRequired } from "../hooks/useLoginRequired";
import type { EnrollFormData } from "../types/enroll";

const EnrollPage: FC = () => {
  const navigate = useNavigate();
  const { modalState, showSuccess, showError, hideModal } = useMessageModal();
  const { showLoginModal, setShowLoginModal } = useAuthStore();
  const { requireLogin } = useLoginRequired();

  // 전역 로그인 모달 상태 감지 (axios 인터셉터에서 설정됨)
  useEffect(() => {
    if (showLoginModal) {
      setShowLoginModal(false);
      requireLogin("등록하시려면 로그인해주세요");
    }
  }, [showLoginModal, setShowLoginModal, requireLogin]);

  // 미리보기 URL
  const [ingNutriPreviews, setIngNutriPreviews] = useState<(string | null)[]>([null, null]);
  const [productPhotoPreview, setProductPhotoPreview] = useState<string | null>(null);

  // 업로드 파일 상태
  const [ingNutriFiles, setIngNutriFiles] = useState<(File | null)[]>([null, null]);
  const [productPhotoFile, setProductPhotoFile] = useState<File | null>(null);

  // 텍스트 필드
  const [companyName, setCompanyName] = useState("");
  const [productName, setProductName] = useState("");

  const { mutate: enrollProduct, isPending } = useEnroll();

  // ✅ 전역 드래그 상태
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };
    const handleDrop = () => setIsDragging(false);

    // ✅ 클립보드 붙여넣기 이벤트 처리
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            // 첫 번째 빈 슬롯에 이미지 추가
            if (!ingNutriFiles[0]) {
              handleIngSlotChange(0, file);
            } else if (!ingNutriFiles[1]) {
              handleIngSlotChange(1, file);
            } else if (!productPhotoFile) {
              handleProdSlotChange(file);
            } else {
              // 모든 슬롯이 차있다면 첫 번째 영양정보 슬롯을 교체
              handleIngSlotChange(0, file);
            }

            showSuccess("클립보드에서 이미지가 추가되었습니다!");
          }
          break;
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
    };
  }, [ingNutriFiles, productPhotoFile, showSuccess]);

  // blob url 정리
  useEffect(() => {
    return () => {
      ingNutriPreviews.forEach((url) => url && URL.revokeObjectURL(url));
      if (productPhotoPreview) URL.revokeObjectURL(productPhotoPreview);
    };
  }, [ingNutriPreviews, productPhotoPreview]);

  const handleIngSlotChange = (index: number, file: File | null) => {
    setIngNutriFiles((prev) => prev.map((f, i) => (i === index ? file : f)));
    setIngNutriPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]!);
      const next = [...prev];
      next[index] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  };

  const handleProdSlotChange = (file: File | null) => {
    setProductPhotoFile(file);
    setProductPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  // 폼 리셋 함수
  const resetForm = () => {
    // 파일 상태 리셋
    setIngNutriFiles([null, null]);
    setProductPhotoFile(null);

    // 미리보기 URL 정리 및 리셋
    ingNutriPreviews.forEach((url) => url && URL.revokeObjectURL(url));
    if (productPhotoPreview) URL.revokeObjectURL(productPhotoPreview);
    setIngNutriPreviews([null, null]);
    setProductPhotoPreview(null);

    // 텍스트 필드 리셋
    setCompanyName("");
    setProductName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      showError("제품명을 입력해 주세요.");
      return;
    }
    if (!companyName.trim()) {
      showError("회사명을 입력해 주세요.");
      return;
    }
    const validIngNutriFiles = ingNutriFiles.filter(Boolean) as File[];
    if (validIngNutriFiles.length < 1) {
      showError("원재료명 및 영양정보 표 사진을 최소 1장 이상 업로드해 주세요.");
      return;
    }

    const formData: EnrollFormData = {
      name: productName.trim(),
      manufacturer: companyName.trim(),
      productImage: productPhotoFile,
      productInfoImages: validIngNutriFiles,
    };

    enrollProduct(formData, {
      onSuccess: () => {
        showSuccess("제품 등록 요청이 정상적으로 완료되었습니다.", "등록 완료", [
          {
            label: "추가 등록",
            onClick: () => {
              hideModal();
              resetForm();
              // 페이지 최상단으로 스크롤
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            variant: "secondary",
          },
          {
            label: "홈으로 이동",
            onClick: () => {
              hideModal();
              navigate("/");
            },
            variant: "primary",
          },
        ]);
      },
      onError: (err: unknown) => {
        console.error(err);

        // 401 에러 (인증 실패) 체크
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { status?: number; data?: { message?: string } } })
            .response;

          if (response?.status === 401) {
            showWarning("등록하시려면 로그인해주세요", "로그인이 필요합니다", [
              {
                label: "홈으로 가기",
                variant: "secondary",
                onClick: () => {
                  hideModal();
                  navigate("/");
                },
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
            return;
          }

          if (response?.data?.message) {
            showError(response.data.message, "등록 실패");
            return;
          }
        }

        showError("제품 등록 중 오류가 발생했습니다.", "등록 실패");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 xl:space-y-16 2xl:space-y-20">
      {/* 배너 */}
      <section className="w-full bg-[#D2EDE4] py-16 text-center relative overflow-hidden">
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D5945] mb-2">제품 등록하기</h1>
          <p className="text-gray-700 mb-2">Tip. 영양정보 라벨이 잘 보이게 찍어주세요!</p>
          <p className="text-sm text-gray-600 mb-1">
            📋 클립보드에 복사한 이미지를 Ctrl+V로 붙여넣거나 드래그로 이미지를 첨부할 수 있어요!
          </p>
          <p className="text-xs text-gray-500">🔧 대용량 이미지는 자동으로 압축되어 업로드됩니다</p>
        </div>
      </section>

      <section className="max-w-6xl xl:max-w-7xl 2xl:max-w-8xl mx-auto px-4 xl:px-6 2xl:px-8 pb-12 xl:pb-16 2xl:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 2xl:gap-20">
          {/* 원재료/영양정보 표 */}
          <div className="flex flex-col gap-3">
            <label className="text-sm xl:text-base 2xl:text-lg font-medium text-gray-800">
              원재료명 및 영양정보 표 사진 등록 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4 xl:gap-6 2xl:gap-8">
              <UploadSlot
                preview={ingNutriPreviews[0]}
                onChange={(file) => handleIngSlotChange(0, file)}
                onClear={() => handleIngSlotChange(0, null)}
                ariaLabel="원재료/영양정보 첫 번째 사진"
                disabled={isPending}
                isDragging={isDragging}
              />
              <UploadSlot
                preview={ingNutriPreviews[1]}
                onChange={(file) => handleIngSlotChange(1, file)}
                onClear={() => handleIngSlotChange(1, null)}
                ariaLabel="원재료/영양정보 두 번째 사진"
                disabled={isPending}
                isDragging={isDragging}
              />
            </div>
            <p className="text-xs xl:text-sm 2xl:text-base text-gray-500">
              원재료와 영양정보 표가 한 장에 다 보이지 않을 때만 사진을 두 장 등록해 주세요.
            </p>
          </div>

          {/* 제품 사진 */}
          <div className="flex flex-col gap-3 xl:gap-4 2xl:gap-5">
            <label className="text-sm xl:text-base 2xl:text-lg font-medium text-gray-800">
              제품 사진 등록 (선택)
            </label>
            <UploadSlot
              preview={productPhotoPreview}
              onChange={handleProdSlotChange}
              onClear={() => handleProdSlotChange(null)}
              ariaLabel="제품 사진"
              disabled={isPending}
              isDragging={isDragging} // ✅ 전달
            />
          </div>
        </div>

        {/* 텍스트 필드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 2xl:gap-10 mt-10 xl:mt-16 2xl:mt-20">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isPending}
              className="w-full px-4 xl:px-5 2xl:px-6 py-3 xl:py-4 2xl:py-5 border border-gray-300 rounded-lg xl:rounded-xl 2xl:rounded-2xl text-base xl:text-lg 2xl:text-xl focus:ring-2 focus:ring-[#79CCB1] focus:border-[#79CCB1] outline-none"
              placeholder="제품명을 입력하세요"
            />
          </div>

          <div className="space-y-2 xl:space-y-3 2xl:space-y-4">
            <label className="text-sm xl:text-base 2xl:text-lg font-medium text-gray-700">
              회사명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isPending}
              className="w-full px-4 xl:px-5 2xl:px-6 py-3 xl:py-4 2xl:py-5 border border-gray-300 rounded-lg xl:rounded-xl 2xl:rounded-2xl text-base xl:text-lg 2xl:text-xl focus:ring-2 focus:ring-[#79CCB1] focus:border-[#79CCB1] outline-none"
              placeholder="회사명을 입력하세요"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-16 xl:mt-20 2xl:mt-24 w-full bg-[#D2EDE4] text-[#2D5945] py-4 xl:py-5 2xl:py-6 rounded-lg xl:rounded-xl 2xl:rounded-2xl font-medium xl:text-lg 2xl:text-xl hover:bg-[#79CCB1] transition-colors disabled:opacity-50"
        >
          {isPending ? "이미지 압축 및 업로드 중…" : "제품 분석 요청하기"}
        </button>
      </section>

      <MessageModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        buttons={modalState.buttons}
        icon={modalState.icon}
      />
    </form>
  );
};

export default EnrollPage;
