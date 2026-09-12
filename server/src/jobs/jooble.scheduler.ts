import cron from "node-cron";
import { importJoobleJobs } from "../services/jooble.service";
import { aggregateJobs } from "../services/jobAggregator.service";

const JOOBLE_TARGET_NEW_JOBS = Number(
  process.env.JOOBLE_TARGET_NEW_JOBS || 300
);

const ARBEITNOW_TARGET_NEW_JOBS = Number(
  process.env.ARBEITNOW_TARGET_NEW_JOBS || 100
);

const JOOBLE_SEARCHES = [
  "software developer",
  "software engineer",
  "full stack developer",
  "frontend developer",
  "backend developer",
  "data analyst",
];

let aggregationRunning = false;

export const runJobAggregationCycle = async () => {
  if (aggregationRunning) {
    console.log(
      "Job aggregation cycle already running. Skipping this cycle."
    );
    return;
  }

  aggregationRunning = true;

  try {
    console.log("========================================");
    console.log("Starting job aggregation cycle...");
    console.log("========================================");

    let joobleImported = 0;
    let arbeitnowImported = 0;

    // JOOBLE
    for (const search of JOOBLE_SEARCHES) {
      const remainingJobs =
        JOOBLE_TARGET_NEW_JOBS - joobleImported;

      if (remainingJobs <= 0) {
        console.log(
          `Jooble target of ${JOOBLE_TARGET_NEW_JOBS} reached.`
        );
        break;
      }

      try {
        const result = await importJoobleJobs({
          keywords: search,
          location: "India",
          maxNewJobs: remainingJobs,
        });

        joobleImported += result.imported;

        console.log(
          `Jooble "${search}" completed:`,
          result
        );

        console.log(
          `Jooble progress: ${joobleImported}/${JOOBLE_TARGET_NEW_JOBS}`
        );
      } catch (error) {
        console.error(
          `Jooble "${search}" import failed:`,
          error
        );
      }
    }

    // ARBEITNOW
    try {
      const result = await aggregateJobs({
        maxNewJobs: ARBEITNOW_TARGET_NEW_JOBS,
      });

      arbeitnowImported = result.imported;

      console.log(
        "Arbeitnow scheduled import completed:",
        result
      );
    } catch (error) {
      console.error(
        "Arbeitnow scheduled import failed:",
        error
      );
    }

    // SUMMARY
    const totalImported =
      joobleImported + arbeitnowImported;

    const jooblePercentage =
      totalImported > 0
        ? (
            (joobleImported / totalImported) *
            100
          ).toFixed(1)
        : "0.0";

    const arbeitnowPercentage =
      totalImported > 0
        ? (
            (arbeitnowImported / totalImported) *
            100
          ).toFixed(1)
        : "0.0";

    console.log("========================================");
    console.log("Job aggregation cycle completed");
    console.log(`Jooble imported: ${joobleImported}`);
    console.log(
      `Arbeitnow imported: ${arbeitnowImported}`
    );
    console.log(`Total imported: ${totalImported}`);
    console.log(
      `Source distribution: Jooble ${jooblePercentage}% / Arbeitnow ${arbeitnowPercentage}%`
    );
    console.log("========================================");
  } finally {
    aggregationRunning = false;
  }
};

export const startJoobleScheduler = () => {
  cron.schedule("0 */6 * * *", async () => {
    await runJobAggregationCycle();
  });

  console.log(
    "Job aggregation scheduler started (every 6 hours)"
  );
};