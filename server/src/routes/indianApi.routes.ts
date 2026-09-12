import express from "express";
import {
  fetchIndianApiJobs,
  importIndianApiJobs,
} from "../services/indianApi.service";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    const data = await fetchIndianApiJobs();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("IndianAPI test error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs from IndianAPI",
    });
  }
});
router.get("/import", async (req, res) => {
  try {
    const result = await importIndianApiJobs();

    res.json({
      success: true,
      message: "IndianAPI jobs imported successfully",
      result,
    });
  } catch (error) {
    console.error("IndianAPI import error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to import IndianAPI jobs",
    });
  }
});
export default router;