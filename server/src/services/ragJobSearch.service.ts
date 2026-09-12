import {
  semanticJobSearch,
} from "./semanticJobSearch.service";

import {
  generateRagAnswer,
} from "./cohereChat.service";

interface RagSearchFilters {
  country?: string;
  city?: string;
  workMode?: string;
  jobType?: string;
  remoteScope?: string;
}

const RAG_JOB_LIMIT = 5;

const MAX_DESCRIPTION_LENGTH = 2000;

const buildJobDocument = (
  job: any
) => {
  const description =
    String(job.description || "")
      .trim()
      .slice(
        0,
        MAX_DESCRIPTION_LENGTH
      );

  const skills =
    Array.isArray(job.skills) &&
    job.skills.length > 0
      ? job.skills.join(", ")
      : "Not specified";

  const salary =
    job.salary
      ? `${job.salary.min ?? "N/A"} - ${
          job.salary.max ?? "N/A"
        } ${job.salary.currency || ""}`.trim()
      : "Not specified";

  return {
    title:
      `${job.title || "Job"} at ${
        job.company || "Unknown company"
      }`,

    text: `
Job ID: ${job._id}

Title: ${job.title || "Not specified"}

Company: ${
      job.company || "Not specified"
    }

Location: ${
      job.location || "Not specified"
    }

City: ${
      job.city || "Not specified"
    }

Country: ${
      job.country || "Not specified"
    }

Work Mode: ${
      job.workMode || "Not specified"
    }

Remote Scope: ${
      job.remoteScope || "Not applicable"
    }

Job Type: ${
      job.jobType || "Not specified"
    }

Skills: ${skills}

Salary: ${salary}

Description:
${description || "Not specified"}

Job URL:
${job.jobUrl || "Not available"}
    `.trim(),
  };
};

export const ragJobSearch = async (
  query: string,
  filters: RagSearchFilters = {}
) => {
  if (!query.trim()) {
    throw new Error(
      "RAG search query cannot be empty"
    );
  }

  // ---------------------------------------------
  // 1. Retrieve relevant jobs
  // ---------------------------------------------

  const semanticResult =
    await semanticJobSearch(
      query,
      filters,
      {
        limit: RAG_JOB_LIMIT,
        page: 1,
        sort: "relevance",
      }
    );

  const jobs =
    semanticResult.jobs || [];

  // ---------------------------------------------
  // 2. No relevant jobs
  // ---------------------------------------------

  if (jobs.length === 0) {
    return {
      query,

      answer:
        "I couldn't find any relevant jobs in the available job data.",

      retrievedJobs: [],

      totalResults:
        semanticResult.totalResults,

      citations: [],
    };
  }

  // ---------------------------------------------
  // 3. Convert retrieved jobs into RAG documents
  // ---------------------------------------------

  const documents =
    jobs.map(buildJobDocument);

  // ---------------------------------------------
  // 4. Ask Cohere using retrieved documents
  // ---------------------------------------------

  const aiResult =
    await generateRagAnswer(
      query,
      documents
    );

  // ---------------------------------------------
  // 5. Return grounded response
  // ---------------------------------------------

  return {
    query,

    answer:
      aiResult.answer,

    citations:
      aiResult.citations,

    retrievedJobs:
      jobs,

    totalResults:
      semanticResult.totalResults,

    contextJobsUsed:
      jobs.length,
  };
};