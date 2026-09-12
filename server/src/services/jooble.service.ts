import Job from "../models/job";
import { normalizeJoobleJob } from "./jooble.normalizer";

const JOOBLE_API_URL = "https://in.jooble.org/api/";

const JOOBLE_RESULTS_PER_PAGE = 20;
const JOOBLE_MAX_PAGES = 15;

interface JoobleSearchParams {
  keywords: string;
  location: string;
  page?: number;
}

interface ImportJoobleJobsOptions {
  keywords: string;
  location: string;
  maxNewJobs?: number;
}

export const fetchJoobleJobs = async ({
  keywords,
  location,
  page = 1,
}: JoobleSearchParams) => {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    throw new Error("JOOBLE_API_KEY is not defined");
  }

  const response = await fetch(
    `${JOOBLE_API_URL}${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords,
        location,
        page,
        ResultOnPage: JOOBLE_RESULTS_PER_PAGE,
        companysearch: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Jooble API request failed: ${response.status}`
    );
  }

  return await response.json();
};

export const importJoobleJobs = async ({
  keywords,
  location,
  maxNewJobs = Infinity,
}: ImportJoobleJobsOptions) => {
  let imported = 0;
  let skipped = 0;
  let totalFetched = 0;

  for (
    let page = 1;
    page <= JOOBLE_MAX_PAGES &&
    imported < maxNewJobs;
    page++
  ) {
    console.log(
      `Fetching Jooble "${keywords}" page ${page}/${JOOBLE_MAX_PAGES}...`
    );

    const response = await fetchJoobleJobs({
      keywords,
      location,
      page,
    });

    const jobs = Array.isArray(response.jobs)
      ? response.jobs
      : [];

    totalFetched += jobs.length;

    if (jobs.length === 0) {
      console.log(
        `Jooble "${keywords}" page ${page} returned no jobs. Stopping.`
      );
      break;
    }

    const normalizedJobs = jobs.map((job: any) =>
      normalizeJoobleJob(job)
    );

    for (const job of normalizedJobs) {
      // Stop immediately once this search has
      // supplied its requested number of new jobs.
      if (imported >= maxNewJobs) {
        break;
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

      const savedJob = await Job.create(job);

      console.log(
        "JOOBLE JOB SAVED:",
        savedJob._id,
        savedJob.title
      );

      imported++;
    }

    if (jobs.length < JOOBLE_RESULTS_PER_PAGE) {
      break;
    }
  }

  return {
    totalFetched,
    imported,
    skipped,
  };
};