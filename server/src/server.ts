import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";
import {
  startJoobleScheduler,
} from "./jobs/jooble.scheduler";

dotenv.config();

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  const requiredVariables = [
    "MONGO_URI",
    "JWT_SECRET",
  ];

  const missingVariables =
    requiredVariables.filter(
      (variable) => !process.env[variable]
    );

  if (missingVariables.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVariables.join(
        ", "
      )}`
    );

    process.exit(1);
  }
};

const startServer = async () => {
  validateEnvironment();

  await connectDB();

  // Start scheduled job aggregation
  startJoobleScheduler();

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
};

startServer();