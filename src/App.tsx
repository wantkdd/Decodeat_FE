import router from "./routes/router";
import { RouterProvider } from "react-router-dom";
import { useUser } from "./hooks/useAuth";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  // 앱 시작 시 사용자 정보 자동 로드
  useUser();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
