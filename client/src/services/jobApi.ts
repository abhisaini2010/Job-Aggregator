const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/jobs`;

export interface MatchSkills {
  matched: string[];
  missing: string[];
  matchedCount: number;
  requiredCount: number;
  percentage: number;
}

export interface MatchExperience {
  compatible: boolean;
  userYears: number;
  requiredYears: number;
  score: number;
}

export interface MatchEducation {
  compatible: boolean;
  score: number;
}

export interface MatchWorkMode {
  compatible: boolean;
  userPreferences: string[];
  jobWorkMode: string;
  score: number;
}

export interface MatchLocation {
  compatible: boolean;
  userCountry: string;
  jobCountry: string | null | undefined;
  jobRemoteScope: string;
  score: number;
}

export interface JobMatchResult {
  matchScore: number;
  skills: MatchSkills;
  experience: MatchExperience;
  education: MatchEducation;
  workMode: MatchWorkMode;
  location: MatchLocation;
  explanation: string;
}

export const fetchJobs = async (
  params: Record<string, string | number> = {}
) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_URL}?${queryParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  return response.json();
};

export const fetchSemanticJobs = async (
  params: Record<string, string | number> = {}
) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== undefined &&
      value !== null
    ) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_URL}/semantic-search?${queryParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to perform semantic job search");
  }

  return response.json();
};

export const fetchRagJobs = async (
  params: Record<string, string | number> = {}
) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== "" &&
      value !== undefined &&
      value !== null
    ) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_URL}/rag-search?${queryParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate AI job answer"
    );
  }

  return response.json();
};

export const fetchAiJobAssistant = async (
  question: string,
  jobIds: string[]
) => {
  const queryParams = new URLSearchParams();

  queryParams.append("q", question);

  jobIds.slice(0, 5).forEach((jobId) => {
    queryParams.append("jobIds", jobId);
  });

  const response = await fetch(
    `${API_URL}/ai-assistant?${queryParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message ||
        "Failed to generate AI assistant response"
    );
  }

  return response.json();
};

export const fetchJobById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch job");
  }

  return response.json();
};

export const fetchJobMatch = async (
  id: string
): Promise<{
  success: boolean;
  jobId: string;
  match: JobMatchResult;
}> => {
  const response = await fetch(`${API_URL}/${id}/match`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch job match");
  }

  return response.json();
};