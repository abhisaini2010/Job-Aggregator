import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db";
import { runJobAggregationCycle } from "./jooble.scheduler";

dotenv.config();

const run = async () => {
  try {
    console.log("Starting Render job aggregation...");

    await connectDB();

    await runJobAggregationCycle();

    console.log(
      "Render job aggregation completed successfully."
    );
  } catch (error) {
    console.error(
      "Render job aggregation failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log("MongoDB connection closed.");
  }
};

run();