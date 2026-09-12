import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";
import Job from "../models/job";

// =========================
// SAVE JOB
// =========================
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id: jobId } = req.params as {id: string};

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.savedJobs) {
      user.savedJobs = [];
    }

    const alreadySaved = user.savedJobs.some(
      (savedJobId) => savedJobId.toString() === jobId
    );

    if (alreadySaved) {
      return res.status(400).json({
        message: "Job already saved",
      });
    }

    user.savedJobs.push(job._id);

    await user.save();

    return res.status(200).json({
      message: "Job saved successfully",
    });
  } catch (error) {
    console.error("Save job error:", error);

    return res.status(500).json({
      message: "Server error while saving job",
    });
  }
};

// =========================
// UNSAVE JOB
// =========================
export const unsaveJob = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { id: jobId } = req.params as {id: string};

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.savedJobs) {
      user.savedJobs = [];
    }

    user.savedJobs = user.savedJobs.filter(
      (savedJobId) => savedJobId.toString() !== jobId
    );

    await user.save();

    return res.status(200).json({
      message: "Job removed from saved jobs",
    });
  } catch (error) {
    console.error("Unsave job error:", error);

    return res.status(500).json({
      message: "Server error while removing saved job",
    });
  }
};

// =========================
// GET SAVED JOBS
// =========================
export const getSavedJobs = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId).populate("savedJobs");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      jobs: user.savedJobs || [],
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);

    return res.status(500).json({
      message: "Server error while fetching saved jobs",
    });
  }
};