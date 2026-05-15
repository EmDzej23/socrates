import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

const embeddingModel = openai.embedding(
  process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small"
);

export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });

  return embedding;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });

  return embeddings;
}
