import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { documents, documentChunks } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { ReprocessButton } from "@/components/archive/ReprocessButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    notFound();
  }

  const [chunkResult] = await db
    .select({ count: count() })
    .from(documentChunks)
    .where(eq(documentChunks.documentId, id));

  const chunkCount = chunkResult?.count ?? 0;

  const chunks = await db
    .select()
    .from(documentChunks)
    .where(eq(documentChunks.documentId, id))
    .orderBy(documentChunks.chunkIndex)
    .limit(10);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/archive/documents"
            className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          >
            ← Back to documents
          </Link>
          <h1 className="mt-4 text-2xl font-medium text-stone-800 dark:text-stone-200">
            {doc.title}
          </h1>
          {doc.author && (
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              by {doc.author}
              {doc.translator && ` (translated by ${doc.translator})`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <ReprocessButton documentId={doc.id} />
          <Link
            href={`/archive/documents/${doc.id}/edit`}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
              Metadata
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-stone-500">Source Type</dt>
                <dd className="mt-1 text-stone-900 dark:text-stone-100">
                  {doc.sourceType.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Reliability</dt>
                <dd className="mt-1 text-stone-900 dark:text-stone-100">
                  {doc.reliability}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Language</dt>
                <dd className="mt-1 text-stone-900 dark:text-stone-100">
                  {doc.language}
                  {doc.originalLanguage && ` (from ${doc.originalLanguage})`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Period</dt>
                <dd className="mt-1 text-stone-900 dark:text-stone-100">
                  {doc.period || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Processing Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      doc.processingStatus === "processed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : doc.processingStatus === "processing"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        : doc.processingStatus === "failed"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    }`}
                  >
                    {doc.processingStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Chunks</dt>
                <dd className="mt-1 text-stone-900 dark:text-stone-100">
                  {chunkCount}
                </dd>
              </div>
            </dl>
          </section>

          {doc.notes && (
            <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
                Notes
              </h2>
              <p className="mt-4 text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                {doc.notes}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
              Content Preview
            </h2>
            <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-stone-50 p-4 text-sm text-stone-700 dark:bg-stone-950 dark:text-stone-300">
              {doc.rawContent.slice(0, 3000)}
              {doc.rawContent.length > 3000 && "..."}
            </pre>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
              Processed Chunks
            </h2>
            {chunks.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">
                No chunks yet. Process the document to create chunks.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {chunks.map((chunk) => (
                  <li
                    key={chunk.id}
                    className="rounded-lg bg-stone-50 p-3 dark:bg-stone-950"
                  >
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Chunk {chunk.chunkIndex + 1}</span>
                      <span>{chunk.tokenEstimate} tokens</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700 dark:text-stone-300 line-clamp-3">
                      {chunk.content}
                    </p>
                  </li>
                ))}
                {chunkCount > 10 && (
                  <p className="text-sm text-stone-500 text-center">
                    ... and {chunkCount - 10} more chunks
                  </p>
                )}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
