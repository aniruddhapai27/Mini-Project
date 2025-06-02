import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // TODO: integrate authentication logic
  const isAuthenticated = false; // Placeholder for auth state

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
