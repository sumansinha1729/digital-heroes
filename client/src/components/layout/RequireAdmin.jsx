import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function RequireAdmin({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return children;
}
