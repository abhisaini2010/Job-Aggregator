import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Wait until authentication check is complete
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in
  return <Outlet />;
};

export default ProtectedRoute;