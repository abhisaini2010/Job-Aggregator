
import mongoose, { Document, Schema } from "mongoose";

export interface IApplication extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  appliedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: ["Applied", "Interview", "Rejected", "Offer"],
      default: "Applied",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);

export default Application;