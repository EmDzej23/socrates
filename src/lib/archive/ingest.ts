import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeText } from "./normalize";
import { chunkText } from "./chunking";
import { createEmbeddings } from "@/lib/ai/embeddings";

export type IngestResult = {
  documentId: string;
  chunkCount: number;
};

export async function ingestDocument(
  documentId: string,
  reprocess = false
): Promise<IngestResult> {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!doc) {
    throw new Error("Document not found");
  }

  await db
    .update(documents)
    .set({ processingStatus: "processing", updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  try {
    if (reprocess) {
      await db.delete(documentChunks).where(eq(documentChunks.documentId, documentId));
    }

    const normalizedContent = normalizeText(doc.rawContent);

    await db
      .update(documents)
      .set({ normalizedContent, updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    const chunks = chunkText(normalizedContent);

    if (chunks.length === 0) {
      await db
        .update(documents)
        .set({
          processingStatus: "processed",
          chunkCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));

      return { documentId, chunkCount: 0 };
    }

    const chunkContents = chunks.map((c) => c.content);
    const embeddings = await createEmbeddings(chunkContents);

    const chunkInserts = chunks.map((chunk, i) => ({
      documentId,
      chunkIndex: chunk.index,
      content: chunk.content,
      tokenEstimate: chunk.tokenEstimate,
      embedding: embeddings[i],
      title: doc.title,
      author: doc.author,
      sourceType: doc.sourceType,
      reliability: doc.reliability,
      language: doc.language,
      metadata: {
        translator: doc.translator,
        period: doc.period,
        originalLanguage: doc.originalLanguage,
      },
    }));

    await db.insert(documentChunks).values(chunkInserts);

    await db
      .update(documents)
      .set({
        processingStatus: "processed",
        chunkCount: chunks.length,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return { documentId, chunkCount: chunks.length };
  } catch (error) {
    console.error("Ingest error:", error);

    await db
      .update(documents)
      .set({ processingStatus: "failed", updatedAt: new Date() })
      .where(eq(documents.id, documentId));

    throw error;
  }
}
