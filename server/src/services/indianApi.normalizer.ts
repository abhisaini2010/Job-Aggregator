import { createJobDuplicateKey } from "../utils/jobDuplicateKey";

interface IndianApiJob {
  id: number | string;
  title: string;
  company: string;
  about_company?: string;
  job_description?: string;
  job_title?: string;
  job_type?: string;
  location?: string;
  experience?: string;
  role_and_responsibility?: string;
  education_and_skills?: string;
  apply_link?: string;
  posted_date?: string;
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

const cleanText = (text: string = "") => {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};
export const normalizeIndianApiJob = (job: IndianApiJob) => {
  const text = `
    ${job.title}
    ${job.job_description || ""}
    ${job.role_and_responsibility || ""}
    ${job.education_and_skills || ""}
  `.toLowerCase();

  // Extract skills
  const skills = extractSkills(text);

  // Determine city
 const city = job.location
  ? cleanText(job.location).split(",")[0].trim()
  : null;

  const duplicateKey = createJobDuplicateKey(
  job.company,
  job.title,
  city
);
  // Determine job type
  let jobType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Internship"
    | "Freelance"
    | "Other" = "Other";

  const type = job.job_type?.toLowerCase() || "";

  if (type.includes("full")) {
    jobType = "Full-time";
  } else if (type.includes("part")) {
    jobType = "Part-time";
  } else if (type.includes("contract")) {
    jobType = "Contract";
  } else if (type.includes("intern")) {
    jobType = "Internship";
  } else if (type.includes("freelance")) {
    jobType = "Freelance";
  }

  // Determine work mode
  let workMode:
    | "Remote"
    | "Hybrid"
    | "Onsite"
    | "Not specified" = "Not specified";

  if (
    text.includes("work from home") ||
    text.includes("work from anywhere") ||
    text.includes("remote")
  ) {
    workMode = "Remote";
  } else if (text.includes("hybrid")) {
    workMode = "Hybrid";
  } else if (
    text.includes("work from office") ||
    text.includes("in office") ||
    text.includes("onsite") ||
    text.includes("on-site")
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

  // Combine useful job information
 const description = cleanText(
  [
    job.job_description,
    job.role_and_responsibility,
    job.education_and_skills,
  ]
    .filter(Boolean)
    .join(" ")
);
  return {
   title: cleanText(job.title) || "Untitled Job",

company: cleanText(job.company) || "Unknown Company",

location: cleanText(job.location) || "India",
    city,

    country: "India",

    description,

    skills,

    salary: {
      min: null,
      max: null,
      currency: "INR",
    },

    jobType,

    workMode,

    remoteScope,

    source: "IndianAPI",

    sourceJobId: String(job.id),

    duplicateKey,

    jobUrl: job.apply_link?.trim() || "",

    postedAt: job.posted_date || null,
  };
};