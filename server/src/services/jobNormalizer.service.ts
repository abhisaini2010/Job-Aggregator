import he from "he";
import { City, Country } from "country-state-city";
import { createJobDuplicateKey } from "../utils/jobDuplicateKey";
interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

const knownSkills = [
  // Languages
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

const cityCountryMap = new Map<string, Set<string>>();

const countries = Country.getAllCountries();

for (const country of countries) {
  const cities = City.getCitiesOfCountry(country.isoCode) || [];

  for (const city of cities) {
    const cityName = city.name.toLowerCase().trim();

    if (!cityCountryMap.has(cityName)) {
      cityCountryMap.set(cityName, new Set());
    }

    cityCountryMap
      .get(cityName)!
      .add(country.name);
  }
}

const normalizeJobType = (jobType?: string) => {
  if (!jobType) return "Other";

  const type = jobType.toLowerCase().trim();

  if (type === "full time" || type === "full-time") {
    return "Full-time";
  }

  if (type === "part time" || type === "part-time") {
    return "Part-time";
  }

  if (type === "contract") {
    return "Contract";
  }

  if (type === "internship") {
    return "Internship";
  }

  if (type === "freelance") {
    return "Freelance";
  }

  return "Other";
};

const normalizeWorkMode = (
  remote: boolean,
  location?: string
) => {
  const value = location?.toLowerCase().trim() || "";

  // Explicit hybrid information
  if (
    value.includes("hybrid") ||
    value.includes("hybride")
  ) {
    return "Hybrid";
  }

  // Explicit remote information
  if (
    remote ||
    value.includes("remote") ||
    value.includes("homeoffice") ||
    value.includes("home office")
  ) {
    return "Remote";
  }

  return "Not specified";
};
const normalizeLocation = (
  location?: string,
  remote: boolean = false
) => {
  if (!location) {
    return {
      city: null,
      country: null,
    };
  }

  const value = location.trim();
  

  if (!value) {
    return {
      city: null,
      country: null,
    };
  }

 const countries = Country.getAllCountries();

const countryMap: Record<string, string> = {};

for (const country of countries) {
  countryMap[country.name.toLowerCase()] = country.name;
}

// Common country aliases
countryMap["deutschland"] = "Germany";
countryMap["uk"] = "United Kingdom";
countryMap["england"] = "United Kingdom";
countryMap["usa"] = "United States";
countryMap["us"] = "United States";
countryMap["u.s."] = "United States";
countryMap["u.s.a."] = "United States";

  const lowerValue = value.toLowerCase();
// Arbeitnow explicitly marks this job as remote
if (remote) {
  // Check if a specific country is mentioned
  for (const country of countries) {
    const countryName = country.name.toLowerCase();

    if (lowerValue.includes(countryName)) {
      return {
        city: null,
        country: country.name,
        remoteScope: "Country",
      };
    }
  }

  // Common aliases
  if (
    lowerValue.includes("remote uk") ||
    lowerValue.includes("remote england")
  ) {
    return {
      city: null,
      country: "United Kingdom",
      remoteScope: "Country",
    };
  }

  if (
    lowerValue.includes("remote us") ||
    lowerValue.includes("remote usa")
  ) {
    return {
      city: null,
      country: "United States",
      remoteScope: "Country",
    };
  }

  // Remote but no country restriction is specified
  return {
    city: null,
    country: null,
    remoteScope: "Worldwide",
  };
}
  // Pure remote locations
  if (
    lowerValue === "remote" ||
    lowerValue === "remote job" ||
    lowerValue === "homeoffice" ||
    lowerValue === "home office"
  ) {
    return {
      city: null,
      country: null,
       remoteScope: "Worldwide",
    };
  }

  // Remote UK
 


  // Hybrid (London)
  const hybridMatch = value.match(/hybrid\s*\(([^)]+)\)/i);

  if (hybridMatch) {
    const cityName = hybridMatch[1].trim();

    return {
      city: cityName,
      country: "United Kingdom",
        remoteScope: "Not applicable",
    };
  }

  // Belfast, Hybrid
  if (lowerValue.includes("hybrid")) {
    const cityName = value
      .replace(/hybrid/gi, "")
      .replace(/,/g, "")
      .trim();

    return {
      city: cityName || null,
      country: null,
       remoteScope: "Not applicable",
    };
  }

  // Location itself is a country
  if (countryMap[lowerValue]) {
    return {
      city: null,
      country: countryMap[lowerValue],
       remoteScope: "Not applicable",
    };
  }

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  let city = parts[0] || null;
  let country: string | null = null;

  // Explicit country provided by source
  const lastPart = parts[parts.length - 1]?.toLowerCase();

  if (lastPart && countryMap[lastPart]) {
    country = countryMap[lastPart];
  }

  // If country is known, don't need city database
  if (country) {
    return {
      city,
      country,
      remoteScope: "Not applicable",
    };
  }

 // Try to resolve city worldwide
if (city) {
  const matchedCountries = cityCountryMap.get(
    city.toLowerCase()
  );

  if (matchedCountries && matchedCountries.size === 1) {
    return {
      city,
      country: [...matchedCountries][0],
        remoteScope: "Not applicable",
    };
  }
}

  return {
    city,
    country: null,
    remoteScope: "Not applicable",
  };
};

const extractSkills = (
  title: string,
  description: string,
  tags: string[] = []
): string[] => {
  const text = `${title} ${description}`.toLowerCase();

  const detectedSkills = new Set<string>();

  for (const skill of knownSkills) {
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const pattern = new RegExp(
      `(^|[^a-z0-9+#])${escapedSkill.toLowerCase()}([^a-z0-9+#]|$)`,
      "i"
    );

    if (pattern.test(text)) {
      detectedSkills.add(skill);
    }
  }

  // Keep useful technical tags from Arbeitnow
  for (const tag of tags) {
    const cleanTag = tag.trim();

    if (!cleanTag) continue;

    const matchingKnownSkill = knownSkills.find(
      (skill) => skill.toLowerCase() === cleanTag.toLowerCase()
    );

    if (matchingKnownSkill) {
      detectedSkills.add(matchingKnownSkill);
    }
  }

  return Array.from(detectedSkills);
};

export const normalizeArbeitnowJob = (job: ArbeitnowJob) => {
  // Remove HTML tags from description
 const cleanDescription = he
  .decode(job.description)
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const normalizedLocation = normalizeLocation(job.location,job.remote);
const duplicateKey = createJobDuplicateKey(
  job.company_name,
  job.title,
  normalizedLocation.city
); 
return {
    title: job.title,

    company: job.company_name,

    location: job.location || "Not specified",

    city: normalizedLocation.city,

    country: normalizedLocation.country,

    description: cleanDescription,

    skills: extractSkills(
  job.title,
  cleanDescription,
  job.tags
),

    salary: {
      min: null,
      max: null,
      currency: "USD",
    },

      jobType: normalizeJobType(job.job_types?.[0]), // it states if a job type exists , use the first one. Otherwise use "other".

    
    workMode: normalizeWorkMode(job.remote,job.location),
    remoteScope: normalizedLocation.remoteScope,
    source: "Arbeitnow",
    sourceJobId: job.slug,
    
     duplicateKey,
    jobUrl: job.url,

    postedAt: job.created_at
      ? new Date(job.created_at * 1000)
      : null,
  };
};