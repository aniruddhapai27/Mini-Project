const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
