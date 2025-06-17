const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const dqRouter = require("./routes/dqRoutes");
const interviewRouter = require("./routes/interviewRoutes");
const { globalErrorHandler } = require("./utils/catchAsync");

dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ], // Allow requests from the frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Connect to MongoDB
try {
  mongoose.connect(process.env.MONGO_URL);
  console.log("✅ MongoDB Connected");
} catch (error) {
  console.log("❌ MongoDB Connection Error:", error);
}

// Proxy configuration
app.use(
  "/api/v1/python",
  createProxyMiddleware({
    target: "http://localhost:8000", // Python service URL
    changeOrigin: true,
    pathRewrite: {
      "^/api/v1/python": "", // Remove base path when forwarding to the target
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Python services proxy
app.use(
  "/api/v1/services",
  createProxyMiddleware({
    target: "http://localhost:8000",
    changeOrigin: true,
    pathRewrite: {
      "^/api/v1/services": "/",
    },
    onError: (err, req, res) => {
      console.log("Python API proxy error:", err.message);
      res.status(503).json({
        success: false,
        message: "Python API service unavailable",
      });
    },
  })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/dq", dqRouter);
app.use("/api/v1/interview", interviewRouter);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
