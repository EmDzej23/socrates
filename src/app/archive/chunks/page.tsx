import { db } from "@/lib/db";
import { documentChunks, documents } from "@/lib/db/schema";
import { desc, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ChunksPage() {
  const [totalResult] = await db.select({ count: count() }).from(documentChunks);
  const totalChunks = totalResult?.count ?? 0;

  const chunks = await db
    .select({
      id: documentChunks.id,
      documentId: documentChunks.documentId,
      chunkIndex: documentChunks.chunkIndex,
      content: documentChunks.content,
      tokenEstimate: documentChunks.tokenEstimate,
      title: documentChunks.title,
      author: documentChunks.author,
      sourceType: documentChunks.sourceType,
      reliability: documentChunks.reliability,
      createdAt: documentChunks.createdAt,
    })
    .from(documentChunks)
    .orderBy(desc(documentChunks.createdAt))
    .limit(50);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium text-stone-800 dark:text-stone-200">
        Document Chunks
      </h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        {totalChunks} chunks in the archive (showing latest 50)
      </p>

      <div className="mt-8">
        {chunks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-700 dark:bg-stone-900">
            <p className="text-stone-600 dark:text-stone-400">
              No chunks yet. Process documents to create chunks.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {chunk.title || "Untitled"}
                      </span>
                      {chunk.author && (
                        <span className="text-stone-500">by {chunk.author}</span>
                      )}
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        Chunk {chunk.chunkIndex + 1}
                      </span>
                      {chunk.sourceType && (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                          {chunk.sourceType.replace(/_/g, " ")}
                        </span>
                      )}
                      {chunk.reliability && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            chunk.reliability === "high"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : chunk.reliability === "medium"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                          }`}
                        >
                          {chunk.reliability}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    <p>{chunk.tokenEstimate} tokens</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
