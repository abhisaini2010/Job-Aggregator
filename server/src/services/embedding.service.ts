import { CohereClientV2 } from "cohere-ai";

const getCohereClient = () => {
  const apiKey =
    process.env.COHERE_API_KEY || process.env.CO_API_KEY;

  if (!apiKey) {
    throw new Error(
      "COHERE_API_KEY or CO_API_KEY is not configured"
    );
  }

  return new CohereClientV2({
    token: apiKey,
  });
};

export const generateEmbedding = async (
  text: string,
  inputType:
    | "search_document"
    | "search_query" = "search_document"
): Promise<number[]> => {
  if (!text.trim()) {
    throw new Error(
      "Cannot generate embedding from empty text"
    );
  }

  const cohere = getCohereClient();

  const response = await cohere.embed({
    model: "embed-v4.0",
    inputType,
    embeddingTypes: ["float"],
    outputDimension: 1024,
    texts: [text],
  });

  const embedding = response.embeddings?.float?.[0];

  if (!embedding) {
    throw new Error(
      "Embedding was not returned by Cohere"
    );
  }

  return embedding;
};

export const generateEmbeddings = async (
  texts: string[],
  inputType:
    | "search_document"
    | "search_query" = "search_document"
): Promise<number[][]> => {
  if (texts.length === 0) {
    return [];
  }

  if (texts.length > 96) {
    throw new Error(
      "Cohere allows a maximum of 96 texts per embedding request"
    );
  }

  const cohere = getCohereClient();

  const response = await cohere.embed({
    model: "embed-v4.0",
    inputType,
    embeddingTypes: ["float"],
    outputDimension: 1024,
    texts,
  });

  const embeddings = response.embeddings?.float;

  if (
    !embeddings ||
    embeddings.length !== texts.length
  ) {
    throw new Error(
      "Cohere did not return embeddings for all texts"
    );
  }

  return embeddings;
};