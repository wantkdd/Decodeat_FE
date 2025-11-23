import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorPage from "../pages/ErrorPage";
import RootLayout from "../layout/RootLayout";
import AuthLayout from "../layout/AuthLayout";

// 🚀 성능 최적화: 페이지 레벨 코드 스플리팅 (React.lazy)
const HomePage = lazy(() => import("../pages/HomePage"));
const EnrollPage = lazy(() => import("../pages/EnrollPage"));
const DetailPage = lazy(() => import("../pages/DetailPage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const MyPage = lazy(() => import("../pages/MyPage"));
const OnBoardingPage = lazy(() => import("../pages/OnboardingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SupportPage = lazy(() => import("../pages/SupportPage"));
const NutritionEncyclopediaPage = lazy(() => import("../pages/NutritionEncyclopediaPage"));
const AdminReportDetail = lazy(() => import("../components/admin/AdminReportDetail"));

/**
 * 페이지 로딩 중 표시할 Suspense Fallback
 */
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#2D5945] border-r-transparent"></div>
      <p className="mt-4 text-gray-600">로딩 중...</p>
    </div>
  </div>
);

/**
 * Suspense로 감싼 컴포넌트를 반환하는 헬퍼 함수
 */
const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: "enroll",
        element: withSuspense(EnrollPage),
      },
      {
        path: "detail/:id",
        element: withSuspense(DetailPage),
      },
      {
        path: "search",
        element: withSuspense(SearchPage),
      },
      {
        path: "myPage",
        element: withSuspense(MyPage),
      },
      {
        path: "onboarding",
        element: withSuspense(OnBoardingPage),
      },
      {
        path: "support",
        element: withSuspense(SupportPage),
      },
      {
        path: "nutrition/encyclopedia",
        element: withSuspense(NutritionEncyclopediaPage),
      },
      {
        path: "admin/reports/:reportId",
        element: withSuspense(AdminReportDetail),
      },
    ],
  },
  // 인증 전용 레이아웃: 상단바 없이 렌더링
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: "/login", element: withSuspense(LoginPage) }],
  },
]);

export default router;
