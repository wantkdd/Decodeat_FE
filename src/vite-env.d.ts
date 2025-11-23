/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * API 기본 URL
   * @example "https://api.decodeat.com"
   */
  readonly VITE_API_BASE_URL: string;

  /**
   * 카카오 OAuth 클라이언트 ID
   * @example "your_kakao_client_id"
   */
  readonly VITE_KAKAO_CLIENT_ID?: string;

  /**
   * 카카오 OAuth 리디렉트 URI
   * @example "https://your-domain.com/auth/kakao/callback"
   */
  readonly VITE_KAKAO_REDIRECT_URI?: string;

  /**
   * 실행 모드
   * @example "development" | "production"
   */
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
