import Job from "../models/job";
import { createJobDuplicateKey } from "../utils/jobDuplicateKey";

export const backfillDuplicateKeys = async () => {
  const jobs = await Job.find({
    $or: [
      { duplicateKey: { $exists: false } },
      { duplicateKey: null },
      { duplicateKey: "" },
    ],
  });

  console.log(`Found ${jobs.length} jobs without duplicateKey`);

  let updated = 0;

  for (const job of jobs) {
    const duplicateKey = createJobDuplicateKey(
      job.company,
      job.title,
      job.get("city") || null
    );

    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          duplicateKey,
        },
      }
    );

    updated++;

    console.log(
      `Updated: ${job.source} → ${job.title} → ${duplicateKey}`
    );
  }

  console.log(`Backfill completed: ${updated} jobs updated`);
};