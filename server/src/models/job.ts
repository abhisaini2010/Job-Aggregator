import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      default: "Not specified",
      trim: true,
    },
    city: {
  type: String,
  default: null,
  trim: true,
},

country: {
  type: String,
  default: null,
  trim: true,
},
    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },
    embedding: {
  type: [Number],
  default: undefined,
},

    salary: {
      min: {
        type: Number,
        default: null,
      },
      max: {
        type: Number,
        default: null,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Freelance",
        "Other",
      ],
      default: "Other",
    },

   workMode: {
  type: String,
  enum: ["Remote", "Hybrid", "Onsite","Not specified"],
  default: "Not specified",
},
remoteScope: {
  type: String,
  enum: ["Worldwide", "Country", "Not applicable"],
  default: "Not applicable",
},
    source: {
      type: String,
      required: true,
      trim: true,
    },
    sourceJobId: {
  type: String,
  required: true,
},
duplicateKey: {
  type: String,
  required: true,
},
    jobUrl: {
      type: String,
      required: true,
      trim: true,
    },

    postedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
jobSchema.index(
  { source: 1, sourceJobId: 1 },
  { unique: true }
);
const Job = mongoose.model("Job", jobSchema);

export default Job;