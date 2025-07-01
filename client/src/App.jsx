import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import QuizSelection from "./pages/QuizSelection";
import Quiz from "./pages/Quiz";
import QuizResults from "./pages/QuizResults";
import MockInterviewSelection from "./pages/MockInterviewSelection";
import MockInterview from "./pages/MockInterview";
import MockInterviewResults from "./pages/MockInterviewResults";
import StudyAssistant from "./pages/StudyAssistant";
import ResumeATSPage from "./pages/ResumeATSPage";
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
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz-selection"
          element={
            <ProtectedRoute>
              <QuizSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="quiz/:subject"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="quiz-results"
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="mock-interview-selection"
          element={
            <ProtectedRoute>
              <MockInterviewSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="mock-interview/:sessionId"
          element={
            <ProtectedRoute>
              <MockInterview />
            </ProtectedRoute>
          }
        />        <Route
          path="mock-interview-results"
          element={
            <ProtectedRoute>
              <MockInterviewResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="study-assistant/:sessionId?"
          element={
            <ProtectedRoute>
              <StudyAssistant />
            </ProtectedRoute>
          }
        />        <Route
          path="resume-ats"
          element={
            <ProtectedRoute>
              <ResumeATSPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
