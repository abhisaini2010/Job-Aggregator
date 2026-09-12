import { generateEmbedding } from "./embedding.service";

export const testEmbedding = async () => {
  const embedding = await generateEmbedding(
    "Frontend developer with React, TypeScript, Node.js and MongoDB experience."
  );

  console.log("Embedding generated successfully.");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
};