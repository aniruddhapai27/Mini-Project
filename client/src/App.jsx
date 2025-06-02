import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Route, Routes } from "react-router-dom";
import { getMe } from "./redux/slices/authSlice";
import Loading from "./components/Loading";

const App = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Check if user is authenticated when app loads
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (loading.me) {
    return <Loading message="Initializing..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
