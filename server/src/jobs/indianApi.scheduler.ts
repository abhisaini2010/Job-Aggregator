import cron from "node-cron";
import { importIndianApiJobs } from "../services/indianApi.service";

export const startIndianApiScheduler = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Starting scheduled IndianAPI job import...");

    try {
      const result = await importIndianApiJobs();

      console.log(
        "IndianAPI scheduled import completed:",
        result
      );
    } catch (error) {
      console.error(
        "Scheduled IndianAPI import failed:",
        error
      );
    }
  });

  console.log("IndianAPI scheduler started");
};