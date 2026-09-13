import express from "express";
import {
  fetchJoobleJobs,
  importJoobleJobs,
} from "../services/jooble.service";
import { normalizeJoobleJob } from "../services/jooble.normalizer";
const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const keywords =
      (req.query.keywords as string) || "software developer";

    const location =
      (req.query.location as string) || "India";

    const response = await fetchJoobleJobs({
      keywords,
      location,
      page: 1,
    });

    const normalizedJobs = response.jobs.map(
      (job: any) => normalizeJoobleJob(job)
    );

    return res.status(200).json({
      success: true,
      totalJobs: response.totalCount,
      jobs: normalizedJobs,
    });
  } catch (error) {
    console.error("Jooble test error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs from Jooble",
    });
  }
});
router.get("/import", async (req, res) => {
  try {
    const keywords =
      (req.query.keywords as string) || "software developer";

    const location =
      (req.query.location as string) || "India";

    const result = await importJoobleJobs({
      keywords,
      location,
    
    });

    return res.status(200).json({
      success: true,
      message: "Jooble jobs imported successfully",
      ...result,
    });
  } catch (error) {
    console.error("Jooble import error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to import Jooble jobs",
    });
  }
});
export default router;