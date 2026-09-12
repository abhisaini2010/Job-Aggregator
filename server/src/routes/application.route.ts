import express from "express";

import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/application.controller";

import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Create a new application
router.post("/", protect, createApplication);

// Get logged-in user's applications
router.get("/", protect, getApplications);

// Update application status
router.patch("/:id/status", protect, updateApplicationStatus);

// Delete application
router.delete("/:id", protect, deleteApplication);

export default router;