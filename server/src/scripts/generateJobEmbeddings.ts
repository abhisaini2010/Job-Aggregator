import "dotenv/config";
import mongoose from "mongoose";

import Job from "../models/job";
import connectDB from "../config/db";
import {
  buildJobEmbeddingText,
} from "../services/jobEmbeddingText.service";
import {
  generateEmbeddings,
} from "../services/embedding.service";

const BATCH_SIZE = 10;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  try {
    console.log("🚀 Starting job embedding backfill...");

    if (!process.env.COHERE_API_KEY) {
      throw new Error("COHERE_API_KEY is not configured");
    }

    // Use the same MongoDB connection used by the main application
    await connectDB();

    console.log("✅ MongoDB connected");

    const jobs = await Job.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
      ],
    });

    console.log(`📦 Jobs needing embeddings: ${jobs.length}`);

    if (jobs.length === 0) {
      console.log("✅ All jobs already have embeddings.");
      return;
    }

    let processed = 0;

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);

      console.log(
        `\n🔄 Processing jobs ${i + 1}-${i + batch.length} of ${jobs.length}...`
      );

      const texts = batch.map((job) =>
        buildJobEmbeddingText(job)
      );

      const embeddings = await generateEmbeddings(texts);

      const bulkOperations = batch.map((job, index) => ({
        updateOne: {
          filter: { _id: job._id },
          update: {
            $set: {
              embedding: embeddings[index],
            },
          },
        },
      }));

      await Job.bulkWrite(bulkOperations);

      processed += batch.length;

      console.log(
        `✅ Saved ${processed}/${jobs.length} job embeddings`
      );

      // Small delay between batches to be gentle with the API
      if (i + BATCH_SIZE < jobs.length) {
        await sleep(10000);
      }
    }

    console.log("\n🎉 Job embedding backfill completed!");
    console.log(`Total processed: ${processed}`);
  } catch (error) {
    console.error("\n❌ Job embedding backfill failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();