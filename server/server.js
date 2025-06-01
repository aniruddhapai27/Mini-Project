const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
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

// Routes
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/user", userRouter);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
