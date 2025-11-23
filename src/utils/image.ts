/**
 * 이미지를 압축하고 리사이징하여 최적화된 JPEG 파일로 변환합니다.
 *
 * @param file - 압축할 원본 이미지 파일
 * @param maxWidth - 최대 너비 (기본값: 1920px)
 * @param maxHeight - 최대 높이 (기본값: 1920px)
 * @param quality - JPEG 압축 품질 0-1 사이 (기본값: 0.8)
 * @returns 압축 및 리사이징된 JPEG 파일
 *
 * @example
 * ```ts
 * const originalFile = new File([blob], 'photo.png');
 * const compressedFile = await compressAndResizeImage(originalFile, 1920, 1920, 0.8);
 * console.log(`압축 전: ${originalFile.size}, 압축 후: ${compressedFile.size}`);
 * ```
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // 원본 크기
      let { width, height } = img;

      // 최대 크기 제한으로 리사이징 계산
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // 고품질 렌더링 설정
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0, width, height);

      // JPEG로 압축 (PNG보다 훨씬 작은 파일 크기)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("이미지 압축 실패"));
            return;
          }

          // 원본 파일명 유지하되 확장자를 .jpg로 변경
          const newFileName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          const compressedFile = new File([blob], newFileName, {
            type: "image/jpeg",
          });

          console.log(
            `압축 전: ${(file.size / 1024 / 1024).toFixed(2)}MB → 압축 후: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        quality, // 압축 품질 (0.8 = 80%)
      );
    };

    img.onerror = () => reject(new Error("이미지 로드 실패"));
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일을 PNG 형식으로 변환합니다.
 *
 * @param file - 변환할 원본 이미지 파일
 * @returns PNG 형식으로 변환된 파일
 *
 * @example
 * ```ts
 * const jpegFile = new File([blob], 'photo.jpg');
 * const pngFile = await convertToPng(jpegFile);
 * ```
 */
export async function convertToPng(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("PNG 변환 실패"));
            return;
          }
          // 원래 이름에서 확장자 제거 후 .png 붙임
          const newFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", {
            type: "image/png",
          });
          resolve(newFile);
        },
        "image/png",
        1,
      );
    };

    reader.readAsDataURL(file);
  });
}
