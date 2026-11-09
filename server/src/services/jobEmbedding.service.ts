import { buildJobEmbeddingText } from "./jobEmbeddingText.service";
import { generateEmbeddings } from "./embedding.service";

type JobEmbeddingInput = {
  title?: string;
  company?: string;
  location?: string;
  city?: string | null;
  country?: string | null;
  workMode?: string;
  remoteScope?: string;
  jobType?: string;
  skills?: string[];
  description?: string;
};

const EMBEDDING_BATCH_SIZE = 96;

export const addJobEmbeddings = async <T extends JobEmbeddingInput>(
  jobs: T[]
): Promise<Array<T & { embedding: number[] }>> => {
  const jobsWithEmbeddings: Array<T & { embedding: number[] }> = [];

  for (
    let start = 0;
    start < jobs.length;
    start += EMBEDDING_BATCH_SIZE
  ) {
    const batch = jobs.slice(
      start,
      start + EMBEDDING_BATCH_SIZE
    );
    const embeddings = await generateEmbeddings(
      batch.map(buildJobEmbeddingText)
    );

    jobsWithEmbeddings.push(
      ...batch.map((job, index) => ({
        ...job,
        embedding: embeddings[index],
      }))
    );
  }

  return jobsWithEmbeddings;
};
