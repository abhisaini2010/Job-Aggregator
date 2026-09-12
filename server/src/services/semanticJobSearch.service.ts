import Job from "../models/job";
import { generateEmbedding } from "./embedding.service";

interface SemanticSearchFilters {
  country?: string;
  city?: string;
  workMode?: string;
  jobType?: string;
  remoteScope?: string;
}

interface SemanticSearchOptions {
  limit?: number;
  page?: number;
  sort?: "relevance" | "newest";
}

export const semanticJobSearch = async (
  query: string,
  filters: SemanticSearchFilters = {},
  options: SemanticSearchOptions = {}
) => {
  if (!query.trim()) {
    throw new Error("Search query cannot be empty");
  }

  // Number of jobs shown on each page
  const limit = Math.min(
    Math.max(options.limit ?? 10, 1),
    20
  );

  const page = Math.max(options.page ?? 1, 1);

  const skip = (page - 1) * limit;

  // Only retrieve the strongest semantic matches
  const semanticCandidateLimit = 50;

  // --------------------------------------------------
  // Generate query embedding
  // --------------------------------------------------

  const queryEmbedding = await generateEmbedding(
    query,
    "search_query"
  );

  
  // --------------------------------------------------
  // Build hard filters
  // --------------------------------------------------

  const filterConditions: Record<string, any> = {};

  if (filters.country) {
    filterConditions.country = filters.country;
  }

  if (filters.city) {
    filterConditions.city = filters.city;
  }

  if (filters.workMode) {
    filterConditions.workMode = filters.workMode;
  }

  if (filters.jobType) {
    filterConditions.jobType = filters.jobType;
  }

  if (filters.remoteScope) {
    filterConditions.remoteScope =
      filters.remoteScope;
  }

  // --------------------------------------------------
  // Vector search
  // --------------------------------------------------

  const vectorSearchStage: any = {
    index: "job_vector_index",
    path: "embedding",
    queryVector: queryEmbedding,

    // Retrieve enough candidates for good
    // semantic ranking.
    numCandidates: 1000,

    // Only keep the top 50 semantic matches.
    limit: semanticCandidateLimit,
  };

  // --------------------------------------------------
  // Apply hard filters inside Vector Search
  // --------------------------------------------------

  if (Object.keys(filterConditions).length > 0) {
    vectorSearchStage.filter = {
      $and: Object.entries(filterConditions).map(
        ([field, value]) => ({
          [field]: {
            $eq: value,
          },
        })
      ),
    };
  }

  // --------------------------------------------------
  // Aggregation pipeline
  // --------------------------------------------------

  const pipeline: any[] = [
    {
      $vectorSearch: vectorSearchStage,
    },
    {
      $project: {
        _id: 1,
        title: 1,
        company: 1,
        location: 1,
        city: 1,
        country: 1,
        description: 1,
        skills: 1,
        salary: 1,
        jobType: 1,
        workMode: 1,
        remoteScope: 1,
        source: 1,
        sourceJobId: 1,
        jobUrl: 1,
        postedAt: 1,
        createdAt: 1,

        // MongoDB vector similarity score
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ];

  // --------------------------------------------------
  // IMPORTANT:
  // Do NOT sort semantic results by newest here.
  //
  // $vectorSearch already returns jobs ordered
  // by semantic similarity.
  // --------------------------------------------------

  // --------------------------------------------------
  // Execute vector search
  // --------------------------------------------------

  const results = await Job.aggregate(pipeline);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalResults = results.length;

  const totalPages =
    totalResults === 0
      ? 0
      : Math.ceil(totalResults / limit);

  // Prevent requesting a page beyond
  // the available semantic results.
  const safePage =
    totalPages > 0
      ? Math.min(page, totalPages)
      : 1;

  const safeSkip =
    (safePage - 1) * limit;

  const jobs = results.slice(
    safeSkip,
    safeSkip + limit
  );

  return {
    jobs,

    totalResults,

    currentPage: safePage,

    totalPages,

    hasNextPage:
      safePage < totalPages,

    hasPreviousPage:
      safePage > 1,
  };
};