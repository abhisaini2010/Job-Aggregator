import { Request, Response } from "express";
import Application from "../models/application";
import Job from "../models/job";

// =========================
// CREATE APPLICATION
// =========================
export const createApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { jobId, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    // Check whether job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      user: userId,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this job",
      });
    }

    // Create application
    const application = await Application.create({
      user: userId,
      job: jobId,
      notes: notes || "",
    });

    return res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error);

    return res.status(500).json({
      message: "Server error while creating application",
    });
  }
};

// =========================
// GET USER APPLICATIONS
// =========================
export const getApplications = async (
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

    const applications = await Application.find({
      user: userId,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    return res.status(500).json({
      message: "Server error while fetching applications",
    });
  }
};

// =========================
// UPDATE APPLICATION STATUS
// =========================
export const updateApplicationStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const allowedStatuses = [
      "Applied",
      "Interview",
      "Rejected",
      "Offer",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status",
      });
    }

    const application = await Application.findOne({
      _id: id,
      user: userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = status;

    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    return res.status(500).json({
      message: "Server error while updating application",
    });
  }
};

// =========================
// DELETE APPLICATION
// =========================
export const deleteApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const application = await Application.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    return res.status(500).json({
      message: "Server error while deleting application",
    });
  }
};