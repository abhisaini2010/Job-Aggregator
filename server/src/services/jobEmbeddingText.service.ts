import Job from "../models/job";

export const buildJobEmbeddingText = (
  job: InstanceType<typeof Job>
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