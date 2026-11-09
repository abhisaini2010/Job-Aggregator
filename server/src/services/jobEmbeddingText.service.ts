type JobEmbeddingTextInput = {
  title?: string;
  company?: string;
  location?: string;
  city?: string | null;
  country?: string | null;
  workMode?: string;
  remoteScope?: string;
  jobType?: string;
  skills?: string[];
  description?: string;
};

export const buildJobEmbeddingText = (
  job: JobEmbeddingTextInput
): string => {
  return [
    `Job Title: ${job.title || ""}`,
    `Company: ${job.company || ""}`,
    `Location: ${job.location || ""}`,
    `City: ${job.city || ""}`,
    `Country: ${job.country || ""}`,
    `Work Mode: ${job.workMode || ""}`,
    `Remote Scope: ${job.remoteScope || ""}`,
    `Job Type: ${job.jobType || ""}`,
    `Skills: ${(job.skills || []).join(", ")}`,
    `Description: ${job.description || ""}`,
  ]
    .filter((value) => value.trim() !== "")
    .join("\n");
};