export interface Job {
  _id: string;
score?: number;
  title: string;
  company: string;

  location: string;
  city: string | null;
  country: string | null;

  description: string;

  skills: string[];

  salary: {
    min: number | null;
    max: number | null;
    currency: string;
  };

  jobType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Internship"
    | "Freelance"
    | "Other";

  workMode:
    | "Remote"
    | "Hybrid"
    | "Not specified";

  remoteScope:
    | "Worldwide"
    | "Country"
    | "Not applicable";

  source: string;
  sourceJobId: string;

  jobUrl: string;

  postedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface JobsResponse {
  success: boolean;

  totalJobs: number;
  currentPage: number;
  totalPages: number;

  jobsReturned: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;

  jobs: Job[];
}