import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "resumes"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const uniqueName =
      `resume-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  if (file.mimetype !== "application/pdf") {
    return cb(
      new Error("Only PDF files are allowed")
    );
  }

  cb(null, true);
};

export const uploadResumeFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});