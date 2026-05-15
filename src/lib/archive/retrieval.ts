import { db } from "@/lib/db";
import { documentChunks, documents } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { createEmbedding } from "@/lib/ai/embeddings";

export type RetrievedChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  title: string | null;
  author: string | null;
  sourceType: string | null;
  reliability: string | null;
  language: string | null;
  similarity: number;
  metadata: Record<string, unknown>;
};

export type RetrievalOptions = {
  query: string;
  limit?: number;
  minReliability?: "high" | "medium" | "low" | "experimental";
  sourceTypes?: string[];
  characterId?: string;
};

const reliabilityOrder = {
  high: 4,
  medium: 3,
  low: 2,
  experimental: 1,
};

export async function retrieveRelevantChunks(
  options: RetrievalOptions
): Promise<RetrievedChunk[]> {
  const { query, limit = 10, minReliability, sourceTypes, characterId } = options;

  const queryEmbedding = await createEmbedding(query);

  const embeddingString = `[${queryEmbedding.join(",")}]`;

  let result;
  
  if (characterId) {
    result = await db.execute(sql`
      SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        dc.title,
        dc.author,
        dc.source_type,
        dc.reliability,
        dc.language,
        dc.metadata,
        1 - (dc.embedding <=> ${embeddingString}::vector) AS similarity
      FROM document_chunks dc
      INNER JOIN documents d ON d.id = dc.document_id
      WHERE dc.embedding IS NOT NULL
        AND d.character_id = ${characterId}
      ORDER BY dc.embedding <=> ${embeddingString}::vector
      LIMIT ${limit * 2}
    `);
  } else {
    result = await db.execute(sql`
      SELECT
        id,
        document_id,
        chunk_index,
        content,
        title,
        author,
        source_type,
        reliability,
        language,
        metadata,
        1 - (embedding <=> ${embeddingString}::vector) AS similarity
      FROM document_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit * 2}
    `);
  }

  let chunks = (result.rows as unknown[]).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      documentId: r.document_id as string,
      chunkIndex: r.chunk_index as number,
      content: r.content as string,
      title: r.title as string | null,
      author: r.author as string | null,
      sourceType: r.source_type as string | null,
      reliability: r.reliability as string | null,
      language: r.language as string | null,
      similarity: r.similarity as number,
      metadata: (r.metadata as Record<string, unknown>) || {},
    };
  });

  if (minReliability) {
    const minOrder = reliabilityOrder[minReliability];
    chunks = chunks.filter((chunk) => {
      const chunkOrder =
        reliabilityOrder[chunk.reliability as keyof typeof reliabilityOrder] || 0;
      return chunkOrder >= minOrder;
    });
  }

  if (sourceTypes && sourceTypes.length > 0) {
    chunks = chunks.filter(
      (chunk) => chunk.sourceType && sourceTypes.includes(chunk.sourceType)
    );
  }

  return chunks.slice(0, limit);
}
