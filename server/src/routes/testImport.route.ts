import express from "express";
import { importIndianApiJobs } from "../services/indianApi.service";
import { importJoobleJobs } from "../services/jooble.service";
import { aggregateJobs } from "../services/jobAggregator.service";

const router = express.Router();

router.get("/indianapi", async (req, res) => {
  try {
    const result = await importIndianApiJobs();

    res.json({
      success: true,
      source: "IndianAPI",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "IndianAPI import failed",
    });
  }
});

router.get("/jooble", async (req, res) => {
  try {
    const result = await importJoobleJobs({
      keywords: "software developer",
      location: "India",
    });

    res.json({
      success: true,
      source: "Jooble",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Jooble import failed",
    });
  }
});

router.get("/arbeitnow", async (req, res) => {
  try {
    const result = await aggregateJobs();

    res.json({
      success: true,
      source: "Arbeitnow",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Arbeitnow import failed",
    });
  }
});

export default router;