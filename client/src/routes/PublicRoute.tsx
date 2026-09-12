import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  // Wait until authentication check is complete
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  // If already logged in, go to Jobs page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access to public auth pages
  return <Outlet />;
};

export default PublicRoute;