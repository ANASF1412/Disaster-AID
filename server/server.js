import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import seedDatabase from "./utils/seed.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import centerRoutes from "./routes/centers.js";
import inventoryRoutes from "./routes/inventory.js";
import volunteerRoutes from "./routes/volunteers.js";
import dispatchRoutes from "./routes/dispatch.js";
import analyticsRoutes from "./routes/analytics.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Eagerly connect on startup so "MongoDB connected" logs immediately
connectDB()
  .then(() => {
    // Auto-seed in development — skipped automatically if data already exists
    if (process.env.NODE_ENV !== "production") {
      seedDatabase().catch((err) =>
        console.error("Seed error:", err.message)
      );
    }
  })
  .catch((err) => console.error("Startup DB connection failed:", err.message));

// Security headers
app.use(helmet());

// CORS — allow frontend origin + localhost dev
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10kb" }));

// Rate limiting — 100 requests per 15 minutes per IP
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
  })
);

// Vercel serverless: ensure DB is connected on every cold-start invocation
// In dev the eager connectDB() above already handles this, but this middleware
// guarantees reconnection after Vercel function recycling in production.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Root route — prevents "Cannot GET /"
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Disaster Relief API is running" });
});

// API info + health
app.get("/api", (_req, res) => {
  res.json({ status: "ok", version: "2.0.0" });
});

app.get("/api/health", (_req, res) => {
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({ status: "ok", mongo: states[mongoose.connection.readyState] ?? "unknown" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — must be last
app.use(globalErrorHandler);

// Local dev only
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Required for Vercel serverless
export default app;
