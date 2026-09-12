import "dotenv/config";
import { generateEmbedding } from "./services/embedding.service";

const runTest = async () => {
  try {
    console.log("Testing Cohere embeddings...");

    const embedding = await generateEmbedding(
      "Frontend developer with React, TypeScript, Node.js and MongoDB experience."
    );

    console.log("✅ Embedding generated successfully");
    console.log("Dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));
  } catch (error) {
    console.error("❌ Embedding test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
};

runTest();