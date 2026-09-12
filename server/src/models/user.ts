import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  savedJobs: mongoose.Types.ObjectId[];

  profile: {
    skills: string[];

    experience: {
      years: number;
      roles: string[];
    };

    education: {
      degree: string;
      field: string;
    };

    location: {
      city: string;
      country: string;
    };

    preferences: {
      jobTypes: string[];
      workModes: string[];
      remoteScope: string;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    savedJobs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    profile: {
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

      location: {
        city: {
          type: String,
          default: "",
          trim: true,
        },

        country: {
          type: String,
          default: "",
          trim: true,
        },
      },

      preferences: {
        jobTypes: {
          type: [String],
          default: [],
        },

        workModes: {
          type: [String],
          default: [],
        },

        remoteScope: {
          type: String,
          default: "",
          trim: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;