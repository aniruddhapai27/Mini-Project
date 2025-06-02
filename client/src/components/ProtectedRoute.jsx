import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (!isAuthenticated && !loading.me) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
