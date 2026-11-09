import Job from "../models/job";
import { normalizeIndianApiJob } from "./indianApi.normalizer";
import { addJobEmbeddings } from "./jobEmbedding.service";

const INDIAN_API_URL = "https://jobs.indianapi.in/jobs";

const INDIAN_API_LIMIT = 100;

export const fetchIndianApiJobs = async () => {
  const apiKey = process.env.INDIANAPI_KEY;

  if (!apiKey) {
    throw new Error("INDIANAPI_KEY is not defined");
  }

  const response = await fetch(
    `${INDIAN_API_URL}?limit=${INDIAN_API_LIMIT}`,
    {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

 if (response.status === 429) {
  console.warn(
    "IndianAPI quota/rate limit reached. Skipping this import."
  );

  return null;
}

if (!response.ok) {
  throw new Error(
    `IndianAPI request failed: ${response.status}`
  );
}
  const data = await response.json();

  console.log(
    `IndianAPI returned up to ${INDIAN_API_LIMIT} jobs`
  );

  return data;
};

export const importIndianApiJobs = async () => {
 const response = await fetchIndianApiJobs();

if (!response) {
  return {
    totalFetched: 0,
    imported: 0,
    skipped: 0,
    reason: "IndianAPI quota/rate limit reached",
  };
}

const jobs = Array.isArray(response)
  ? response
  : response.data;

  if (!Array.isArray(jobs)) {
    throw new Error("Invalid IndianAPI jobs response");
  }

  const normalizedJobs = jobs.map((job: any) =>
    normalizeIndianApiJob(job)
  );

  let imported = 0;
  let skipped = 0;
  const jobsToImport = [];
  const pendingSourceJobIds = new Set<string>();
  const pendingDuplicateKeys = new Set<string>();

  for (const job of normalizedJobs) {
   if (
    pendingSourceJobIds.has(String(job.sourceJobId)) ||
    pendingDuplicateKeys.has(String(job.duplicateKey))
   ) {
    skipped++;
    continue;
   }

   const existingJob = await Job.findOne({
  $or: [
    {
      source: job.source,
      sourceJobId: job.sourceJobId,
    },
    {
      duplicateKey: job.duplicateKey,
    },
  ],
});

    if (existingJob) {
      skipped++;
      continue;
    }

    jobsToImport.push(job);
    pendingSourceJobIds.add(String(job.sourceJobId));
    pendingDuplicateKeys.add(String(job.duplicateKey));
  }

  const jobsWithEmbeddings =
    await addJobEmbeddings(jobsToImport);

  for (const job of jobsWithEmbeddings) {
    const savedJob = await Job.create(job);

    console.log(
      "INDIAN API JOB SAVED:",
      savedJob._id,
      savedJob.title
    );

    imported++;
  }

  return {
    totalFetched: normalizedJobs.length,
    imported,
    skipped,
  };
};