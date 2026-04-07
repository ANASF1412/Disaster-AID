import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route — prevents "Cannot GET /"
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Disaster Relief API is running" });
});

// API base route
app.get("/api", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

// Health check — shows MongoDB connection state
app.get("/api/health", (_req, res) => {
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  const state = mongoose.connection.readyState;
  res.json({ status: "ok", mongo: states[state] ?? "unknown" });
});

// MongoDB connection (non-blocking — safe even if URI is empty)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err.message));
}

// Local dev server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Required for Vercel serverless
export default app;
