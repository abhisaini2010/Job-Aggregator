import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import jobRoutes from "./routes/job.route";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import applicationRoutes from "./routes/application.route";
import joobleRoutes from "./routes/jooble.routes";
import indianApiRoutes from "./routes/indianApi.routes";
import testImportRoutes from "./routes/testImport.route";
import resumeRoutes from "./routes/resume.route";
import {
  generalRateLimiter,
  authRateLimiter,
 } from "./middleware/rateLimit.middleware";
import { protect } from "./middleware/auth.middleware";

const app = express();

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// =========================
// SECURITY
// =========================

app.use(helmet());




// =========================
// CORS
// =========================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// =========================
// BODY PARSING
// =========================

app.use(express.json({ limit: "1mb" }));

app.use(cookieParser());

// API RATE LIMITING
app.use("/api", generalRateLimiter);
app.use("/api/auth", authRateLimiter);

// =========================
// API ROUTES
// =========================

app.use("/api/jobs", jobRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/jooble", joobleRoutes);

app.use("/api/indian-api", indianApiRoutes);

app.use("/api/resumes", resumeRoutes);

// =========================
// DEVELOPMENT / TEST ROUTES
// =========================

if (process.env.NODE_ENV !== "production") {
  app.use("/api/test-import", testImportRoutes);
}

// =========================
// AUTH TEST ROUTE
// =========================

app.get("/api/auth/protected", protect, (req, res) => {
  res.json({
    message: "You are authenticated",
    userId: req.userId,
  });
});

// =========================
// HEALTH CHECK
// =========================

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Job Aggregator API is running",
  });
});

export default app;