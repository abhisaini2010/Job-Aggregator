import { Types } from "mongoose";
import Job from "../models/job";
import { fetchArbeitnowJobs } from "./jobFetcher.service";
import { normalizeArbeitnowJob } from "./jobNormalizer.service";
import { addJobEmbeddings } from "./jobEmbedding.service";

type NormalizedArbeitnowJob =
  ReturnType<typeof normalizeArbeitnowJob>;

interface AggregateJobsOptions {
  maxNewJobs?: number;
}

export const aggregateJobs = async ({
  maxNewJobs = Infinity,
}: AggregateJobsOptions = {}) => {
  try {
    // 1. Fetch jobs from Arbeitnow
    const jobs = await fetchArbeitnowJobs();

    console.log(
      `Fetched ${jobs.length} jobs from Arbeitnow`
    );

    // 2. Normalize every job
    const normalizedJobs: NormalizedArbeitnowJob[] =
      jobs.map((job: any) =>
        normalizeArbeitnowJob(job)
      );

    // 3. Remove duplicate jobs returned within
    //    the same Arbeitnow response
    const uniqueJobMap = new Map<
      string,
      NormalizedArbeitnowJob
    >();

    for (const job of normalizedJobs) {
      uniqueJobMap.set(
        `${job.source}:${job.sourceJobId}`,
        job
      );
    }

    const uniqueJobs: NormalizedArbeitnowJob[] =
      Array.from(uniqueJobMap.values());

    console.log(
      `Unique Arbeitnow jobs after response deduplication: ${uniqueJobs.length}`
    );

    if (uniqueJobs.length === 0) {
      return {
        totalFetched: jobs.length,
        uniqueFetched: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
      };
    }

    // 4. Find existing jobs
    const sourceJobIds = uniqueJobs.map(
      (job) => job.sourceJobId
    );

    const duplicateKeys = uniqueJobs
      .map((job) => job.duplicateKey)
      .filter(
        (key): key is string =>
          Boolean(key)
      );

    const existingJobs = await Job.find({
      $or: [
        {
          source: "Arbeitnow",
          sourceJobId: {
            $in: sourceJobIds,
          },
        },
        ...(duplicateKeys.length > 0
          ? [
              {
                duplicateKey: {
                  $in: duplicateKeys,
                },
              },
            ]
          : []),
      ],
    })
      .select(
        "_id source sourceJobId duplicateKey"
      )
      .lean();

    // 5. Create lookup maps
    const existingBySourceJobId = new Map<
      string,
      any
    >();

    const existingByDuplicateKey = new Map<
      string,
      any
    >();

    for (const existingJob of existingJobs) {
      if (
        existingJob.source === "Arbeitnow" &&
        existingJob.sourceJobId
      ) {
        existingBySourceJobId.set(
          String(existingJob.sourceJobId),
          existingJob
        );
      }

      if (existingJob.duplicateKey) {
        existingByDuplicateKey.set(
          String(existingJob.duplicateKey),
          existingJob
        );
      }
    }

    // 6. Select new jobs and existing jobs to refresh
    const jobsToWrite: Array<{
      job: NormalizedArbeitnowJob;
      existingId?: Types.ObjectId;
    }> = [];

    let newJobCandidates = 0;
    let skipped = 0;

    for (const job of uniqueJobs) {
      const sourceJobId = String(
        job.sourceJobId
      );

      // Existing Arbeitnow job
      const existingById =
        existingBySourceJobId.get(
          sourceJobId
        );

      if (existingById) {
        jobsToWrite.push({
          job,
          existingId: existingById._id,
        });

        continue;
      }

      // Duplicate already exists elsewhere
      if (
        job.duplicateKey &&
        existingByDuplicateKey.has(
          String(job.duplicateKey)
        )
      ) {
        skipped++;
        continue;
      }

      // New job
      if (newJobCandidates >= maxNewJobs) {
        skipped++;
        continue;
      }

      jobsToWrite.push({ job });
      newJobCandidates++;
    }

    // 7. Nothing to write
    if (jobsToWrite.length === 0) {
      console.log(
        "No Arbeitnow jobs need to be written."
      );

      return {
        totalFetched: jobs.length,
        uniqueFetched: uniqueJobs.length,
        imported: 0,
        updated: 0,
        skipped,
      };
    }

    const jobsWithEmbeddings = await addJobEmbeddings(
      jobsToWrite.map(({ job }) => job)
    );

    const operations: Parameters<
      typeof Job.bulkWrite
    >[0] = [];

    for (let index = 0; index < jobsToWrite.length; index++) {
      const { job, existingId } = jobsToWrite[index];
      const jobWithEmbedding =
        jobsWithEmbeddings[index];

      if (existingId) {
        operations.push({
          updateOne: {
            filter: { _id: existingId },
            update: { $set: jobWithEmbedding },
          },
        });
      } else {
        operations.push({
          updateOne: {
            filter: {
              source: job.source,
              sourceJobId: job.sourceJobId,
            },
            update: { $set: jobWithEmbedding },
            upsert: true,
          },
        });
      }
    }

    // 8. Insert new jobs / update existing jobs
    const result = await Job.bulkWrite(
      operations
    );

    const imported = result.upsertedCount;
    const updated = result.modifiedCount;

    console.log(
      `Arbeitnow aggregation completed: ${imported} new, ${updated} updated, ${skipped} skipped`
    );

    return {
      totalFetched: jobs.length,
      uniqueFetched: uniqueJobs.length,
      imported,
      updated,
      skipped,
    };
  } catch (error) {
    console.error(
      "Error aggregating jobs:",
      error
    );

    throw error;
  }
};