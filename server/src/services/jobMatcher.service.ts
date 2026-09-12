import { IUser } from "../models/user";

interface MatchSkills {
  matched: string[];
  missing: string[];
  matchedCount: number;
  requiredCount: number;
  percentage: number;
}

interface MatchExperience {
  compatible: boolean;
  userYears: number;
  requiredYears: number;
  score: number;
}

interface MatchEducation {
  compatible: boolean;
  score: number;
}

interface MatchWorkMode {
  compatible: boolean;
  userPreferences: string[];
  jobWorkMode: string;
  score: number;
}

interface MatchLocation {
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

const normalizeText = (value: string = ""): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

const skillAliases: Record<string, string> = {
  react: "react",
  "react.js": "react",

  node: "node.js",
  "node.js": "node.js",

  express: "express.js",
  "express.js": "express.js",

  mongodb: "mongodb",
  mongo: "mongodb",

  mysql: "mysql",

  javascript: "javascript",
  js: "javascript",

  typescript: "typescript",
  ts: "typescript",

  tailwind: "tailwind css",
  "tailwind css": "tailwind css",

  html: "html",
  html5: "html",

  css: "css",
  css3: "css",

  git: "git",
  github: "github",

  sql: "sql",

  "c++": "c++",
  cpp: "c++",

  "c#": "c#",
};

const normalizeSkill = (skill: string): string => {
  const normalized = normalizeText(skill);

  return skillAliases[normalized] || normalized;
};

/**
 * Skill matching
 */
export const calculateSkillMatch = (
  userSkills: string[],
  jobSkills: string[]
): MatchSkills => {
  const normalizedUserSkills = new Set(
    userSkills.map(normalizeSkill)
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const jobSkill of jobSkills) {
    const normalizedJobSkill = normalizeSkill(jobSkill);

    if (normalizedUserSkills.has(normalizedJobSkill)) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  }

  const requiredCount = jobSkills.length;
  const matchedCount = matched.length;

  const percentage =
    requiredCount === 0
      ? 0
      : Math.round((matchedCount / requiredCount) * 100);

  return {
    matched,
    missing,
    matchedCount,
    requiredCount,
    percentage,
  };
};

/**
 * Extract approximate required years from job text.
 *
 * Examples:
 * "2 years experience" -> 2
 * "3+ years experience" -> 3
 * "5 yrs experience" -> 5
 */
const extractRequiredExperience = (
  jobDescription: string
): number => {
  const text = normalizeText(jobDescription);

  const patterns = [
    /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/,
    /experience\s*(?:of|:)?\s*(\d+)\s*\+?\s*years?/,
    /(\d+)\s*\+?\s*yrs?\s+(?:of\s+)?experience/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return 0;
};

/**
 * Experience matching
 */
const calculateExperienceMatch = (
  userYears: number,
  jobDescription: string
): MatchExperience => {
  const requiredYears =
    extractRequiredExperience(jobDescription);

  // If the job does not specify experience,
  // don't penalize the user.
  if (requiredYears === 0) {
    return {
      compatible: true,
      userYears,
      requiredYears: 0,
      score: 100,
    };
  }

  if (userYears >= requiredYears) {
    return {
      compatible: true,
      userYears,
      requiredYears,
      score: 100,
    };
  }

  // User is short by one year
  if (userYears + 1 >= requiredYears) {
    return {
      compatible: true,
      userYears,
      requiredYears,
      score: 70,
    };
  }

  return {
    compatible: false,
    userYears,
    requiredYears,
    score: 30,
  };
};

/**
 * Education matching
 */
const calculateEducationMatch = (
  userEducation: {
    degree: string;
    field: string;
  },
  jobDescription: string
): MatchEducation => {
  const degree = normalizeText(userEducation.degree);
  const field = normalizeText(userEducation.field);
  const text = normalizeText(jobDescription);

  // No education information in the user's profile.
  if (!degree && !field) {
    return {
      compatible: true,
      score: 70,
    };
  }

  let degreeMatch = false;
  let fieldMatch = false;

  if (degree) {
    degreeMatch = text.includes(degree);
  }

  if (field) {
    fieldMatch = text.includes(field);
  }

  // Both degree and field match
  if (degreeMatch && fieldMatch) {
    return {
      compatible: true,
      score: 100,
    };
  }

  // Either degree or field matches
  if (degreeMatch || fieldMatch) {
    return {
      compatible: true,
      score: 80,
    };
  }

  // If the job doesn't appear to mention education,
  // don't heavily penalize the user.
  const educationKeywords = [
    "bachelor",
    "b.tech",
    "btech",
    "master",
    "m.tech",
    "mtech",
    "degree",
    "computer science",
    "engineering",
    "qualification",
    "education",
  ];

  const mentionsEducation = educationKeywords.some(
    (keyword) => text.includes(keyword)
  );

  if (!mentionsEducation) {
    return {
      compatible: true,
      score: 80,
    };
  }

  return {
    compatible: false,
    score: 40,
  };
};

/**
 * Work-mode matching
 */
const calculateWorkModeMatch = (
  userWorkModes: string[],
  jobWorkMode: string
): MatchWorkMode => {
  const normalizedPreferences =
    userWorkModes.map(normalizeText);

  const normalizedJobMode = normalizeText(jobWorkMode);

  // User has no preference.
  if (normalizedPreferences.length === 0) {
    return {
      compatible: true,
      userPreferences: userWorkModes,
      jobWorkMode,
      score: 80,
    };
  }

  // Job does not specify a work mode.
  // We cannot determine compatibility,
  // so use a neutral score.
  if (
    !normalizedJobMode ||
    normalizedJobMode === "not specified"
  ) {
    return {
      compatible: true,
      userPreferences: userWorkModes,
      jobWorkMode,
      score: 70,
    };
  }

  // Job matches one of the user's preferred work modes.
  if (normalizedPreferences.includes(normalizedJobMode)) {
    return {
      compatible: true,
      userPreferences: userWorkModes,
      jobWorkMode,
      score: 100,
    };
  }

  // Job has a specified mode that conflicts
  // with the user's preference.
  return {
    compatible: false,
    userPreferences: userWorkModes,
    jobWorkMode,
    score: 30,
  };
};

/**
 * Location / remote matching
 */
const calculateLocationMatch = (
  userCountry: string,
  jobCountry: string | null | undefined,
  jobRemoteScope: string
): MatchLocation => {
  const normalizedUserCountry =
    normalizeText(userCountry);

  const normalizedJobCountry =
    normalizeText(jobCountry || "");

  const normalizedRemoteScope =
    normalizeText(jobRemoteScope);

  // Worldwide remote job
  if (normalizedRemoteScope === "worldwide") {
    return {
      compatible: true,
      userCountry,
      jobCountry,
      jobRemoteScope,
      score: 100,
    };
  }

  // Same country
  if (
    normalizedUserCountry &&
    normalizedJobCountry &&
    normalizedUserCountry === normalizedJobCountry
  ) {
    return {
      compatible: true,
      userCountry,
      jobCountry,
      jobRemoteScope,
      score: 100,
    };
  }

  // Country-restricted remote job
  if (
    normalizedRemoteScope === "country" &&
    normalizedUserCountry === normalizedJobCountry
  ) {
    return {
      compatible: true,
      userCountry,
      jobCountry,
      jobRemoteScope,
      score: 100,
    };
  }

  // Job doesn't have location information
  if (!normalizedJobCountry) {
    return {
      compatible: true,
      userCountry,
      jobCountry,
      jobRemoteScope,
      score: 70,
    };
  }

  return {
    compatible: false,
    userCountry,
    jobCountry,
    jobRemoteScope,
    score: 30,
  };
};

/**
 * Build human-readable explanation
 */
const buildExplanation = (
  skills: MatchSkills,
  experience: MatchExperience,
  education: MatchEducation,
  workMode: MatchWorkMode,
  location: MatchLocation
): string => {
  const parts: string[] = [];

  if (skills.matched.length > 0) {
    parts.push(
      `You match ${skills.matched.length} of ${skills.requiredCount} required skills.`
    );
  } else if (skills.requiredCount > 0) {
    parts.push(
      "None of the detected job skills currently match your profile."
    );
  }

  if (skills.missing.length > 0) {
    parts.push(
      `Missing skills: ${skills.missing.join(", ")}.`
    );
  }

  if (experience.compatible) {
    if (experience.requiredYears > 0) {
      parts.push(
        `Your ${experience.userYears} year(s) of experience is compatible with the approximately ${experience.requiredYears} year(s) requested.`
      );
    }
  } else {
    parts.push(
      `The job appears to require around ${experience.requiredYears} year(s) of experience, while your profile has ${experience.userYears}.`
    );
  }

  if (!education.compatible) {
    parts.push(
      "Your education does not clearly match the education requirements detected in the job description."
    );
  }

  // Job work mode is unknown.
  if (
    workMode.jobWorkMode &&
    normalizeText(workMode.jobWorkMode) === "not specified"
  ) {
    parts.push(
      "The job does not specify a work mode, so compatibility cannot be fully determined."
    );
  } else if (!workMode.compatible) {
    parts.push(
      `The job is ${workMode.jobWorkMode}, which does not match your current work-mode preferences.`
    );
  }

  if (!location.compatible) {
    parts.push(
      "The job location may not match your profile location."
    );
  }

  return parts.join(" ");
};

/**
 * Complete job matching
 */
export const calculateJobMatch = (
  user: IUser,
  job: {
    skills: string[];
    description: string;
    workMode: string;
    country?: string | null;
    remoteScope: string;
  }
): JobMatchResult => {
  const userProfile = user.profile;

  const userSkills =
    userProfile?.skills || [];

  const skills = calculateSkillMatch(
    userSkills,
    job.skills || []
  );

  const experience = calculateExperienceMatch(
    userProfile?.experience?.years || 0,
    job.description || ""
  );

  const education = calculateEducationMatch(
    userProfile?.education || {
      degree: "",
      field: "",
    },
    job.description || ""
  );

  const workMode = calculateWorkModeMatch(
    userProfile?.preferences?.workModes || [],
    job.workMode
  );

  const location = calculateLocationMatch(
    userProfile?.location?.country || "",
    job.country,
    job.remoteScope
  );

  /**
   * Final weighted score
   *
   * Skills       = 50%
   * Experience   = 20%
   * Education    = 10%
   * Work Mode    = 10%
   * Location     = 10%
   */
  const matchScore = Math.round(
    skills.percentage * 0.50 +
      experience.score * 0.20 +
      education.score * 0.10 +
      workMode.score * 0.10 +
      location.score * 0.10
  );

  const explanation = buildExplanation(
    skills,
    experience,
    education,
    workMode,
    location
  );

  return {
    matchScore,
    skills,
    experience,
    education,
    workMode,
    location,
    explanation,
  };
};