import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-10">Checking login...</div>;

  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}
