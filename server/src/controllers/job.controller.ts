import { Request, Response } from "express";
import Job from "../models/job";
import User from "../models/user";
import { calculateJobMatch } from "../services/jobMatcher.service";
import { semanticJobSearch } from "../services/semanticJobSearch.service";
import {
  ragJobSearch,
} from "../services/ragJobSearch.service";
import {
  aiJobAssistant,
} from "../services/aiJobAssistant.service";
export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      location,
      city,
      country,
      workMode,
      jobType,
        remoteScope,
     
      sort = "latest",
      page = "1",
      limit = "10",
    } = req.query;

    const filter: any = {};

    // Keyword search
   if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { skills: { $regex: keyword, $options: "i" } },
      ];
}
    // Location filter
   if (location) {
  filter.$and = filter.$and || [];

  filter.$and.push({
    $or: [
      { location: { $regex: location, $options: "i" } },
      { city: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
    ],
  });
}
    // City filter
if (city) {
  filter.city = {
    $regex: city,
    $options: "i",
  };
}

// Country filter
 if (country) {
      if (workMode === "Remote") {
        filter.$and = filter.$and || [];

        filter.$and.push({
          $or: [
            { country: { $regex: country, $options: "i" } },
            { country: null },
          ],
        });
      } else {
        filter.country = {
          $regex: country,
          $options: "i",
        };
      }
    }

    // Work mode filter
 if (workMode) {
  filter.workMode = workMode;
}

// Job type filter
if (jobType) {
  filter.jobType = jobType;
}
// Remote scope filter
if (remoteScope) {
  filter.remoteScope = remoteScope;
}

   const pageNumber = Math.max(Number(page) || 1, 1);
const requestedLimit = Number(limit) || 10;
const limitNumber = Math.min(
  Math.max(requestedLimit, 1),
  50
);

const skip = (pageNumber - 1) * limitNumber;

   let sortOption: any = { postedAt: -1 };

if (sort === "oldest") {
  sortOption = { postedAt: 1 };
}

const jobs = await Job.find(filter)
  .sort(sortOption)
  .skip(skip)
  .limit(limitNumber);

    const totalJobs = await Job.countDocuments(filter);

   const totalPages = Math.ceil(totalJobs / limitNumber);

res.status(200).json({
  success: true,
  totalJobs,
  currentPage: pageNumber,
  totalPages,
  jobsReturned: jobs.length,
  hasNextPage: pageNumber < totalPages,
  hasPreviousPage: pageNumber > 1,
  jobs,
});
  } catch (error) {
    console.error("Error fetching jobs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
  
};
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error fetching job:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
    });
  }
};

export const getJobMatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const matchResult = calculateJobMatch(
  user,
  {
    skills: job.skills,
    description: job.description,
    workMode: job.workMode,
    country: job.country,
    remoteScope: job.remoteScope,
  }
);
    return res.status(200).json({
      success: true,
      jobId: job._id,
      match: matchResult,
    });
  } catch (error) {
    console.error("Error calculating job match:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate job match",
    });
  }
};
export const semanticSearchJobs = async (
  req: Request,
  res: Response
) => {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const pageParam = Number(
      req.query.page || 1
    );

    const limitParam = Number(
      req.query.limit || 10
    );

    const page = Math.max(
      pageParam,
      1
    );

    const limit = Math.min(
      Math.max(limitParam, 1),
      20
    );

    const sortParam = String(
      req.query.sort || "relevance"
    );

    const sort =
      sortParam === "newest"
        ? "newest"
        : "relevance";

    const country = req.query.country
      ? String(req.query.country).trim()
      : undefined;

    const city = req.query.city
      ? String(req.query.city).trim()
      : undefined;

    const workMode = req.query.workMode
      ? String(req.query.workMode).trim()
      : undefined;

    const jobType = req.query.jobType
      ? String(req.query.jobType).trim()
      : undefined;

    const remoteScope =
      req.query.remoteScope
        ? String(req.query.remoteScope).trim()
        : undefined;

    const result =
      await semanticJobSearch(
        query,
        {
          country,
          city,
          workMode,
          jobType,
          remoteScope,
        },
        {
          limit,
          page,
          sort,
        }
      );

    return res.status(200).json({
      success: true,

      query,

      page: result.currentPage,

      limit,

      sort,

      filters: {
        country,
        city,
        workMode,
        jobType,
        remoteScope,
      },

      count: result.jobs.length,

      totalResults:
        result.totalResults,

      totalPages:
        result.totalPages,

      hasNextPage:
        result.hasNextPage,

      hasPreviousPage:
        result.hasPreviousPage,

      jobs: result.jobs,
    });
  } catch (error) {
    console.error(
      "Semantic job search failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to perform semantic job search",
    });
  }
};

export const ragSearchJobs = async (
  req: Request,
  res: Response
) => {
  try {
    const query = String(
      req.query.q || ""
    ).trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message:
          "Search query is required",
      });
    }

    const country =
      req.query.country
        ? String(
            req.query.country
          ).trim()
        : undefined;

    const city =
      req.query.city
        ? String(
            req.query.city
          ).trim()
        : undefined;

    const workMode =
      req.query.workMode
        ? String(
            req.query.workMode
          ).trim()
        : undefined;

    const jobType =
      req.query.jobType
        ? String(
            req.query.jobType
          ).trim()
        : undefined;

    const remoteScope =
      req.query.remoteScope
        ? String(
            req.query.remoteScope
          ).trim()
        : undefined;

    const result =
      await ragJobSearch(
        query,
        {
          country,
          city,
          workMode,
          jobType,
          remoteScope,
        }
      );

    return res.status(200).json({
      success: true,

      query:
        result.query,

      answer:
        result.answer,

      totalResults:
        result.totalResults,

      contextJobsUsed:
        result.contextJobsUsed || 0,

      citations:
        result.citations || [],

      retrievedJobs:
        result.retrievedJobs,
    });
  } catch (error) {
    console.error(
      "RAG job search failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to perform RAG job search",
    });
  }
};

export const aiJobAssistantSearch = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Assistant question is required",
      });
    }

    const rawJobIds = req.query.jobIds;

    const jobIds = Array.isArray(rawJobIds)
      ? rawJobIds.map(String).filter(Boolean)
      : rawJobIds
      ? [String(rawJobIds)]
      : [];

    if (jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one job is required for AI analysis",
      });
    }

    const user = await User.findById(req.userId).select("name profile");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await aiJobAssistant(query, {
      userProfile: {
        name: user.name,
        ...user.profile,
      },
      jobIds,
    });

    return res.status(200).json({
      success: true,
      query: result.query,
      answer: result.answer,
      contextJobsUsed: result.contextJobsUsed,
      totalResults: result.totalResults,
      citations: result.citations,
      retrievedJobs: result.retrievedJobs,
    });
  } catch (error) {
    console.error("AI job assistant failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI assistant response",
    });
  }
};