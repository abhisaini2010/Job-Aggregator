export interface ParsedResumeData {
  name: string;
  skills: string[];
  experience: {
    years: number;
    roles: string[];
  };
  education: {
    degree: string;
    field: string;
  };
  jobTitles: string[];
  projects: string[];
}

const normalizeLine = (line: string): string => {
  return line
    .replace(/\u00ad/g, "") // soft hyphen
    .replace(/[\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const cleanText = (text: string): string => {
  return text
    .replace(/\u00ad/g, "")
    .replace(/-\s*\n/g, "")
    .replace(/\r/g, "")
    .trim();
};

/**
 * Extract name from the beginning of the resume.
 */
const extractName = (lines: string[]): string => {
  for (const line of lines.slice(0, 5)) {
    const normalized = normalizeLine(line);

    if (
      normalized &&
      !/^phone:/i.test(normalized) &&
      !/^email:/i.test(normalized) &&
      !/^linkedin:/i.test(normalized) &&
      !/^github:/i.test(normalized)
    ) {
      return normalized;
    }
  }

  return "";
};

/**
 * Extract technical skills from the Technical Skills section.
 */
const extractSkills = (lines: string[]): string[] => {
  const skills: string[] = [];

  const startIndex = lines.findIndex(
    (line) => normalizeLine(line).toLowerCase() === "technical skills"
  );

  if (startIndex === -1) {
    return [];
  }

  const sectionLines: string[] = [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);

    if (!line) continue;

    if (
      [
        "projects",
        "experience",
        "education",
        "achievements",
        "soft skills",
      ].includes(line.toLowerCase())
    ) {
      break;
    }

    sectionLines.push(line);
  }

  for (const line of sectionLines) {
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const values = line
      .slice(colonIndex + 1)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    skills.push(...values);
  }

  // Remove duplicates while preserving original order.
  return [...new Set(skills)];
};

/**
 * Extract education from the Education section.
 */
const extractEducation = (
  lines: string[]
): ParsedResumeData["education"] => {
  const education = {
    degree: "",
    field: "",
  };

  const startIndex = lines.findIndex(
    (line) => normalizeLine(line).toLowerCase() === "education"
  );

  if (startIndex === -1) {
    return education;
  }

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);

    if (!line) continue;

    const lower = line.toLowerCase();

    if (
      [
        "technical skills",
        "projects",
        "experience",
        "achievements",
        "soft skills",
      ].includes(lower)
    ) {
      break;
    }

    /**
     * Example from the user's resume:
     *
     * Bachelor of Technology in Computer Science & Engineering
     * Expected Graduation: 2027
     */
    const degreeMatch = line.match(
      /(Bachelor(?:\s+of\s+Technology)?|B\.?Tech|B\.?E\.?|Master(?:\s+of\s+Technology)?|M\.?Tech|M\.?E\.?)/i
    );

    if (degreeMatch) {
      const degree = degreeMatch[1];

      education.degree = /b\.?tech/i.test(degree)
        ? "Bachelor of Technology"
        : /b\.?e\.?/i.test(degree)
        ? "Bachelor of Engineering"
        : /m\.?tech/i.test(degree)
        ? "Master of Technology"
        : /m\.?e\.?/i.test(degree)
        ? "Master of Engineering"
        : degree;

      const inMatch = line.match(
        /\bin\s+(.+?)(?:\s+Expected Graduation:|\s*$)/i
      );

      if (inMatch) {
        education.field = inMatch[1]
          .replace(/\s+/g, " ")
          .trim();
      }

      break;
    }
  }

  return education;
};

/**
 * Determine whether a line looks like a technology stack.
 *
 * This is the key signal used for project-title detection.
 *
 * Example:
 *
 * AI Learning Assistant (AI Notes Generator)
 * React.js, TypeScript, Tailwind CSS, AI API
 *
 * The second line clearly looks like a technology stack,
 * so the first line is treated as the project title.
 */
const looksLikeTechnologyLine = (line: string): boolean => {
  const normalized = normalizeLine(line);

  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("•")) {
    return false;
  }

  if (!normalized.includes(",")) {
    return false;
  }

  const technologyKeywords = [
    "react",
    "react.js",
    "typescript",
    "javascript",
    "node",
    "node.js",
    "express",
    "express.js",
    "mongodb",
    "mysql",
    "sql",
    "tailwind",
    "html",
    "css",
    "python",
    "java",
    "c++",
    "c#",
    "git",
    "github",
    "api",
    "cloudinary",
    "next.js",
    "nextjs",
  ];

  const lower = normalized.toLowerCase();

  const matchedKeywords = technologyKeywords.filter((keyword) =>
    lower.includes(keyword)
  );

  return matchedKeywords.length >= 1;
};

/**
 * Extract project titles.
 *
 * We don't treat every non-bullet line as a project.
 * Instead, a project title must be immediately followed by
 * a technology-stack line.
 */
const extractProjects = (lines: string[]): string[] => {
  const projects: string[] = [];

  const startIndex = lines.findIndex(
    (line) => normalizeLine(line).toLowerCase() === "projects"
  );

  if (startIndex === -1) {
    return [];
  }

  for (let i = startIndex + 1; i < lines.length - 1; i++) {
    const currentLine = normalizeLine(lines[i]);
    const nextLine = normalizeLine(lines[i + 1]);

    if (!currentLine) {
      continue;
    }

    // Stop when the next resume section begins.
    if (
      [
        "achievements",
        "soft skills",
        "experience",
        "education",
        "technical skills",
      ].includes(currentLine.toLowerCase())
    ) {
      break;
    }

    // Bullet points are descriptions, never project titles.
    if (currentLine.startsWith("•")) {
      continue;
    }

    /**
     * A project title is followed by a technology stack.
     */
    if (looksLikeTechnologyLine(nextLine)) {
      projects.push(currentLine);
      i++;
    }
  }

  return [...new Set(projects)];
};

/**
 * Extract job titles from the Summary section.
 */
const extractJobTitles = (
  lines: string[]
): string[] => {
  const titles: string[] = [];

  const summaryIndex = lines.findIndex(
    (line) => normalizeLine(line).toLowerCase() === "summary"
  );

  if (summaryIndex === -1) {
    return [];
  }

  for (let i = summaryIndex + 1; i < lines.length; i++) {
    const line = normalizeLine(lines[i]);

    if (!line) continue;

    if (
      [
        "education",
        "technical skills",
        "projects",
        "experience",
        "achievements",
        "soft skills",
      ].includes(line.toLowerCase())
    ) {
      break;
    }

    /**
     * Current resume starts the summary with:
     *
     * Frontend Developer skilled in...
     */
    const titleMatch = line.match(
      /^([A-Za-z][A-Za-z\s-]{2,40}?)\s+(?:skilled|experienced|with|specializing|developing)\b/i
    );

    if (titleMatch) {
      titles.push(titleMatch[1].trim());
    }
  }

  return [...new Set(titles)];
};

/**
 * Extract experience information.
 *
 * We intentionally do NOT infer years from projects.
 * If the resume doesn't explicitly state professional
 * experience, years remain 0.
 */
const extractExperience = (
  lines: string[]
): ParsedResumeData["experience"] => {
  const roles: string[] = [];

  const experienceIndex = lines.findIndex(
    (line) => normalizeLine(line).toLowerCase() === "experience"
  );

  if (experienceIndex !== -1) {
    for (
      let i = experienceIndex + 1;
      i < lines.length;
      i++
    ) {
      const line = normalizeLine(lines[i]);

      if (!line) continue;

      if (
        [
          "education",
          "technical skills",
          "projects",
          "achievements",
          "soft skills",
        ].includes(line.toLowerCase())
      ) {
        break;
      }

      if (!line.startsWith("•")) {
        roles.push(line);
      }
    }
  }

  return {
    years: 0,
    roles: [...new Set(roles)],
  };
};

/**
 * Main resume parser.
 */
export const parseResumeText = (
  extractedText: string
): ParsedResumeData => {
  const cleanedText = cleanText(extractedText);

  const lines = cleanedText
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

  const education = extractEducation(lines);
  const projects = extractProjects(lines);
  const jobTitles = extractJobTitles(lines);

  const experience = extractExperience(lines);

  /**
   * If no explicit Experience section exists, use the
   * detected summary job title as a role.
   *
   * This does NOT turn it into professional experience.
   */
  if (
    experience.roles.length === 0 &&
    jobTitles.length > 0
  ) {
    experience.roles = [...jobTitles];
  }

  return {
    name: extractName(lines),
    skills: extractSkills(lines),
    experience,
    education,
    jobTitles,
    projects,
  };
};