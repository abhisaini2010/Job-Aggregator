import { Request, Response } from "express";
import fs from "node:fs/promises";
import Resume from "../models/resume";
import { extractResumeText } from "../services/resumeTextExtractor.service";
import { parseResumeText } from "../services/resumeParser.service";
import { syncResumeWithUserProfile } from "../services/resumeProfileSync.service";


export const uploadResume = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    const extractedText = await extractResumeText(
      req.file.path
    );


    if (!extractedText) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from this PDF. Please upload a text-based PDF resume.",
      });
    }
const parsedData = parseResumeText(
  extractedText
);
let profileUpdated = false;

try {
  if (!req.userId) {
    throw new Error("User ID not found");
  }

  await syncResumeWithUserProfile(
    req.userId,
    parsedData
  );

  profileUpdated = true;
} catch (profileError) {
  console.error(
    "Resume profile sync error:",
    profileError
  );
}
    const existingResume = await Resume.findOne({
      user: req.userId,
    });

    if (existingResume) {
      await fs
        .unlink(existingResume.filePath)
        .catch(() => {});

      existingResume.originalName =
        req.file.originalname;

      existingResume.fileName =
        req.file.filename;

      existingResume.filePath =
        req.file.path;

      existingResume.mimeType =
        req.file.mimetype;

      existingResume.fileSize =
        req.file.size;

      existingResume.extractedText =
        extractedText;

        existingResume.parsedData =
  parsedData;

      await existingResume.save();

      return res.status(200).json({
        success: true,
        message: "Resume replaced successfully",
         profileUpdated,
        resume: {
          id: existingResume._id,
          originalName: existingResume.originalName,
          fileName: existingResume.fileName,
          fileSize: existingResume.fileSize,
          mimeType: existingResume.mimeType,
          extractedText: existingResume.extractedText,
          parsedData: existingResume.parsedData,
          createdAt: existingResume.createdAt,
          updatedAt: existingResume.updatedAt,
        },
      });
    }

  const resume = await Resume.create({
  user: req.userId,
  originalName: req.file.originalname,
  fileName: req.file.filename,
  filePath: req.file.path,
  mimeType: req.file.mimetype,
  fileSize: req.file.size,
  extractedText,
  parsedData,
});

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and text extracted successfully",
      profileUpdated,
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        extractedText: resume.extractedText,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Upload/extract resume error:",
      error
    );

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload and extract resume",
    });
  }
};
export const getResume = async (
  req: Request,
  res: Response
) => {
  try {
    const resume = await Resume.findOne({
      user: req.userId,
    }).select(
      "originalName fileName fileSize mimeType extractedText parsedData createdAt updatedAt"
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    return res.status(200).json({
      success: true,
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        extractedText: resume.extractedText,
        parsedData: resume.parsedData,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
    });
  }
};