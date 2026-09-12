import { Request, Response } from "express";
import User from "../models/user";

// =========================
// GET USER PROFILE
// =========================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select(
      "name email profile"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      profile: {
        name: user.name,
        email: user.email,
        ...user.profile,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

// =========================
// UPDATE USER PROFILE
// =========================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      skills,
      experience,
      education,
      location,
      preferences,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.profile = {
      skills: Array.isArray(skills) ? skills : [],

      experience: {
        years:
          typeof experience?.years === "number"
            ? experience.years
            : 0,

        roles: Array.isArray(experience?.roles)
          ? experience.roles
          : [],
      },

      education: {
        degree: education?.degree || "",
        field: education?.field || "",
      },

      location: {
        city: location?.city || "",
        country: location?.country || "",
      },

      preferences: {
        jobTypes: Array.isArray(preferences?.jobTypes)
          ? preferences.jobTypes
          : [],

        workModes: Array.isArray(preferences?.workModes)
          ? preferences.workModes
          : [],

        remoteScope: preferences?.remoteScope || "",
      },
    };

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        name: user.name,
        email: user.email,
        ...user.profile,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error while updating profile",
    });
  }
};