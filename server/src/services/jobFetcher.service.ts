import axios from "axios";

const ARBEITNOW_API =
  "https://www.arbeitnow.com/api/job-board-api";

const ARBEITNOW_MAX_JOBS = 100;
const ARBEITNOW_MAX_PAGES = 10;

export const fetchArbeitnowJobs = async () => {
  try {
    const allJobs: any[] = [];

    for (
      let page = 1;
      page <= ARBEITNOW_MAX_PAGES;
      page++
    ) {
      console.log(
        `Fetching Arbeitnow page ${page}/${ARBEITNOW_MAX_PAGES}...`
      );

      const response = await axios.get(
        `${ARBEITNOW_API}?page=${page}`
      );

      const pageJobs = Array.isArray(
        response.data.data
      )
        ? response.data.data
        : [];

      if (pageJobs.length === 0) {
        console.log(
          `Arbeitnow page ${page} returned no jobs. Stopping.`
        );
        break;
      }

      allJobs.push(...pageJobs);

      console.log(
        `Arbeitnow page ${page}: ${pageJobs.length} jobs`
      );

      if (
        allJobs.length >=
        ARBEITNOW_MAX_JOBS
      ) {
        break;
      }
    }

    const jobs = allJobs.slice(
      0,
      ARBEITNOW_MAX_JOBS
    );

    console.log(
      `Total Arbeitnow jobs collected: ${jobs.length}`
    );

    return jobs;
  } catch (error) {
    console.error(
      "Error fetching jobs from Arbeitnow:",
      error
    );

    throw new Error(
      "Failed to fetch jobs from Arbeitnow"
    );
  }
};