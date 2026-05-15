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
    <div className="p-8" style={{ fontFamily: 'var(--font-serif)' }}>
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/archive/documents"
            className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)] italic"
          >
            ← Back to documents
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
            {doc.title}
          </h1>
          {doc.author && (
            <p className="mt-1 text-lg text-[var(--ink-light)] italic">
              by {doc.author}
              {doc.translator && ` (translated by ${doc.translator})`}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <ReprocessButton documentId={doc.id} />
          <Link
            href={`/archive/documents/${doc.id}/edit`}
            className="border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              Metadata
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Source Type</dt>
                <dd className="mt-1 text-[var(--ink)]">
                  {doc.sourceType.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Reliability</dt>
                <dd className="mt-1 text-[var(--ink)]">
                  {doc.reliability}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Language</dt>
                <dd className="mt-1 text-[var(--ink)]">
                  {doc.language}
                  {doc.originalLanguage && ` (from ${doc.originalLanguage})`}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Period</dt>
                <dd className="mt-1 text-[var(--ink)]">
                  {doc.period || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Processing Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 text-sm ${
                      doc.processingStatus === "processed"
                        ? "bg-[var(--olive)] text-[var(--parchment)]"
                        : doc.processingStatus === "processing"
                        ? "bg-[var(--gold)] text-[var(--parchment)]"
                        : doc.processingStatus === "failed"
                        ? "bg-[var(--terracotta)] text-[var(--parchment)]"
                        : "bg-[var(--ink-light)] text-[var(--parchment)]"
                    }`}
                  >
                    {doc.processingStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-[var(--ink-light)] uppercase tracking-wider">Chunks</dt>
                <dd className="mt-1 text-[var(--ink)]">
                  {chunkCount}
                </dd>
              </div>
            </dl>
          </section>

          {doc.notes && (
            <section className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Notes
              </h2>
              <p className="mt-4 text-[var(--ink-light)] whitespace-pre-wrap">
                {doc.notes}
              </p>
            </section>
          )}

          <section className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              Content Preview
            </h2>
            <pre className="mt-4 max-h-96 overflow-auto bg-[var(--parchment-dark)] p-4 text-sm text-[var(--ink)] whitespace-pre-wrap">
              {doc.rawContent.slice(0, 3000)}
              {doc.rawContent.length > 3000 && "..."}
            </pre>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              Processed Chunks
            </h2>
            {chunks.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--ink-light)] italic">
                No chunks yet. Process the document to create chunks.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {chunks.map((chunk) => (
                  <li
                    key={chunk.id}
                    className="bg-[var(--parchment-dark)] p-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[var(--ink-light)] uppercase tracking-wider">
                      <span>Chunk {chunk.chunkIndex + 1}</span>
                      <span>{chunk.tokenEstimate} tokens</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--ink)] line-clamp-3">
                      {chunk.content}
                    </p>
                  </li>
                ))}
                {chunkCount > 10 && (
                  <p className="text-sm text-[var(--ink-light)] text-center italic">
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
