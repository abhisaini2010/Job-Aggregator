import express from "express";
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/savedJob.controller";
import { aiRateLimiter } from "../middleware/rateLimit.middleware";
import { protect } from "../middleware/auth.middleware";
import {
  getJobs,
  getJobById,
   getJobMatch,
   semanticSearchJobs,
  ragSearchJobs,
   aiJobAssistantSearch,
} from "../controllers/job.controller";

const router = express.Router();

// Your existing routes...

router.get("/", getJobs);
router.get("/semantic-search", semanticSearchJobs);
router.get("/rag-search", ragSearchJobs);
router.get(
  "/ai-assistant",
  protect,
  aiRateLimiter,
  aiJobAssistantSearch
);
// Saved jobs — BEFORE /:id

router.post("/:id/save", protect, saveJob);
router.delete("/:id/save", protect, unsaveJob);
router.get("/saved", protect, getSavedJobs);

// Job match — BEFORE /:id

router.get("/:id/match", protect, getJobMatch);

// Individual job — AFTER /saved

router.get("/:id", getJobById);

export default router;