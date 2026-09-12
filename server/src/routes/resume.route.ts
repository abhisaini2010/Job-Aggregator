import express from "express";
import {   getResume,uploadResume } from "../controllers/resume.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadResumeFile } from "../middleware/resumeUpload.middleware";

const router = express.Router();
router.get("/", protect, getResume);

router.post(
  "/upload",
  protect,
  uploadResumeFile.single("resume"),
  uploadResume
);

export default router;