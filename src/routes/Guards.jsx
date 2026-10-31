import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-[#831843]/20 border-t-[#831843] rounded-full animate-spin" />
        <p className="text-sm text-[#6B756F]">Checking your session...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isLoggedIn, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) return <AuthLoadingScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function CustomerRoute({ children }) {
  const { isLoggedIn, isAdmin, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) return <AuthLoadingScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) return <AuthLoadingScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
