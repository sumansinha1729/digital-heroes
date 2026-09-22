import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
