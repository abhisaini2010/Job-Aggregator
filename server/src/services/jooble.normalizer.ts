
import { createJobDuplicateKey } from "../utils/jobDuplicateKey";interface JoobleJob {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: number | string;
}
const knownSkills = [
  // Programming languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Golang",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",
  "Rust",

  // Frontend
  "React",
  "React.js",
  "Next.js",
  "Angular",
  "Vue.js",
  "Nuxt.js",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Bootstrap",

  // Backend
  "Node.js",
  "Express",
  "Express.js",
  "NestJS",
  "Django",
  "Flask",
  "Spring Boot",
  "Laravel",
  "ASP.NET",

  // Databases
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "SQL",
  "Redis",
  "Firebase",

  // Cloud / DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Jenkins",

  // APIs / Architecture
  "REST API",
  "GraphQL",
  "Microservices",

  // Mobile
  "Flutter",
  "React Native",

  // Tools
  "Git",
  "GitHub",
  "GitLab",

  // AI / Data
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
];

const extractSkills = (text: string): string[] => {
  const detectedSkills = new Set<string>();

  for (const skill of knownSkills) {
    const escapedSkill = skill.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const pattern = new RegExp(
      `(^|[^a-z0-9+#])${escapedSkill.toLowerCase()}([^a-z0-9+#]|$)`,
      "i"
    );

    if (pattern.test(text)) {
      detectedSkills.add(skill);
    }
  }

  return Array.from(detectedSkills);
};

export const normalizeJoobleJob = (job: JoobleJob) => {
  // Remove HTML tags and decode basic HTML entities
  const cleanDescription = job.snippet
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  // Try to determine city
  const city = job.location
    ? job.location.split(",")[0].trim()
    : null;

const duplicateKey = createJobDuplicateKey(
  job.company,
  job.title,
  city
);

  // Since this is the India Jooble API
  const country = "India";

  // Determine job type
  let jobType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Internship"
    | "Freelance"
    | "Other" = "Other";

 const type = job.type?.toLowerCase() || "";

const jobText = `${job.title} ${job.snippet}`.toLowerCase();

if (
  type.includes("intern") ||
  jobText.includes("internship") ||
  jobText.includes("intern ")
) {
  jobType = "Internship";
} else if (
  type.includes("freelance") ||
  jobText.includes("freelance")
) {
  jobType = "Freelance";
} else if (
  type.includes("contract") ||
  jobText.includes("contract")
) {
  jobType = "Contract";
} else if (
  type.includes("part") ||
  jobText.includes("part-time") ||
  jobText.includes("part time")
) {
  jobType = "Part-time";
} else if (
  type.includes("full") ||
  jobText.includes("full-time") ||
  jobText.includes("full time")
) {
  jobType = "Full-time";
}

 // Determine work mode from description/location
const text = `${job.title} ${job.location} ${job.snippet}`.toLowerCase();

const skills = extractSkills(text);

let workMode:
  | "Remote"
  | "Hybrid"
  | "Onsite"
  | "Not specified" = "Not specified";

// Remote
if (
  text.includes("work from home") ||
  text.includes("work from anywhere") ||
  text.includes("fully remote") ||
  text.includes("remote-first") ||
  text.includes("remote position") ||
  text.includes("remote role") ||
  text.includes("remote job") ||
  text.includes("wfh")
) {
  workMode = "Remote";
}

// Hybrid
else if (
  text.includes("hybrid") ||
  text.includes("hybrid work") ||
  text.includes("hybrid role") ||
  text.includes("hybrid position")
) {
  workMode = "Hybrid";
}

// Onsite
else if (
  text.includes("work from office") ||
  text.includes("work from-office") ||
  text.includes("wfo") ||
  text.includes("on-site") ||
  text.includes("onsite") ||
  text.includes("in office") ||
  text.includes("office-based")
) {
  workMode = "Onsite";
}

  // Determine remote scope
  let remoteScope:
    | "Worldwide"
    | "Country"
    | "Not applicable" = "Not applicable";

  if (workMode === "Remote") {
    if (
      text.includes("worldwide") ||
      text.includes("work from anywhere") ||
      text.includes("anywhere in the world")
    ) {
      remoteScope = "Worldwide";
    } else {
      remoteScope = "Country";
    }
  }

  return {
    title: job.title?.trim() || "Untitled Job",

    company: job.company?.trim() || "Unknown Company",

    location: job.location?.trim() || "India",

    city,

    country,

    description: cleanDescription,

    skills,

    salary: {
      min: null,
      max: null,
      currency: "INR",
    },

    jobType,

    workMode,

    remoteScope,

    source: job.source?.trim() || "Jooble",

     sourceJobId: job.link,

     duplicateKey,

    jobUrl: job.link?.trim() || "",

    postedAt: job.updated || null,
  };
};