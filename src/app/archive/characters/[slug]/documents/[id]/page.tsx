import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { characters, documents, documentChunks } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { ReprocessButton } from "@/components/archive/ReprocessButton";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function DocumentDetailPage({ params }: PageProps) {
  const { slug, id } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!document || document.characterId !== character.id) {
    notFound();
  }

  const [chunkCount] = await db
    .select({ count: count() })
    .from(documentChunks)
    .where(eq(documentChunks.documentId, id));

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-[var(--ink-light)]">
            <Link href={`/archive/characters/${slug}`} className="hover:text-[var(--ink)]">
              {character.name}
            </Link>
            {" / "}
            <Link href={`/archive/characters/${slug}/documents`} className="hover:text-[var(--ink)]">
              Documents
            </Link>
            {" / "}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">{document.title}</h1>
          {document.author && (
            <p className="mt-1 text-[var(--ink-light)]">by {document.author}</p>
          )}
        </div>
        <div className="flex gap-2">
          <ReprocessButton documentId={document.id} />
          <Link
            href={`/archive/characters/${slug}/documents/${id}/edit`}
            className="border-2 border-[var(--ink-light)] border-opacity-30 px-4 py-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
          <div className="text-xs text-[var(--ink-light)] uppercase tracking-wider">Status</div>
          <div
            className={`mt-1 inline-block px-2 py-0.5 text-sm ${
              document.processingStatus === "processed"
                ? "bg-[var(--olive)] text-[var(--parchment)]"
                : document.processingStatus === "failed"
                ? "bg-[var(--terracotta)] text-[var(--parchment)]"
                : "bg-[var(--gold)] text-[var(--parchment)]"
            }`}
          >
            {document.processingStatus}
          </div>
        </div>
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
          <div className="text-xs text-[var(--ink-light)] uppercase tracking-wider">Source Type</div>
          <div className="mt-1 text-[var(--ink)]">{document.sourceType.replace(/_/g, " ")}</div>
        </div>
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
          <div className="text-xs text-[var(--ink-light)] uppercase tracking-wider">Reliability</div>
          <div className="mt-1 text-[var(--ink)]">{document.reliability}</div>
        </div>
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
          <div className="text-xs text-[var(--ink-light)] uppercase tracking-wider">Chunks</div>
          <div className="mt-1 text-[var(--ink)]">{chunkCount?.count || 0}</div>
        </div>
      </div>

      {document.notes && (
        <div className="mt-6 border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Notes</h2>
          <p className="mt-2 text-[var(--ink-light)] whitespace-pre-wrap">{document.notes}</p>
        </div>
      )}

      <div className="mt-6 border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Content Preview</h2>
        <pre className="mt-2 max-h-96 overflow-auto text-sm text-[var(--ink-light)] whitespace-pre-wrap">
          {document.rawContent.slice(0, 5000)}
          {document.rawContent.length > 5000 && "..."}
        </pre>
      </div>
    </div>
  );
}
