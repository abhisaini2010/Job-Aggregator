import mongoose, { Document, Schema } from "mongoose";

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  extractedText: string;

  parsedData: {
    name: string;
    skills: string[];
    experience: {
      years: number;
      roles: string[];
    };
    education: {
      degree: string;
      field: string;
    };
    jobTitles: string[];
    projects: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    parsedData: {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      skills: {
        type: [String],
        default: [],
      },

      experience: {
        years: {
          type: Number,
          default: 0,
          min: 0,
        },

        roles: {
          type: [String],
          default: [],
        },
      },

      education: {
        degree: {
          type: String,
          default: "",
          trim: true,
        },

        field: {
          type: String,
          default: "",
          trim: true,
        },
      },

      jobTitles: {
        type: [String],
        default: [],
      },

      projects: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model<IResume>("Resume", resumeSchema);

export default Resume;