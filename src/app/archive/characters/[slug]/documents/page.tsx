import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { characters, documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CharacterDocumentsPage({ params }: PageProps) {
  const { slug } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.characterId, character.id))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--ink-light)]">
            <Link href={`/archive/characters/${slug}`} className="hover:text-[var(--ink)]">
              {character.name}
            </Link>
            {" / "}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Documents</h1>
          <p className="mt-1 text-[var(--ink-light)] italic">
            Source texts and reference materials for {character.name}.
          </p>
        </div>
        <Link
          href={`/archive/characters/${slug}/documents/new`}
          className="bg-[var(--ink)] px-4 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] transition-colors"
        >
          Add Document
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            href={`/archive/characters/${slug}/documents/${doc.id}`}
            className="block border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--ink)]">{doc.title}</h2>
                {doc.author && (
                  <p className="text-sm text-[var(--ink-light)]">by {doc.author}</p>
                )}
              </div>
              <span
                className={`text-xs px-2 py-0.5 ${
                  doc.processingStatus === "processed"
                    ? "bg-[var(--olive)] text-[var(--parchment)]"
                    : doc.processingStatus === "failed"
                    ? "bg-[var(--terracotta)] text-[var(--parchment)]"
                    : "bg-[var(--gold)] text-[var(--parchment)]"
                }`}
              >
                {doc.processingStatus}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-[var(--ink-light)]">
              <span>{doc.sourceType.replace(/_/g, " ")}</span>
              <span>{doc.reliability} reliability</span>
              {doc.chunkCount && <span>{doc.chunkCount} chunks</span>}
            </div>
          </Link>
        ))}
      </div>

      {docs.length === 0 && (
        <div className="mt-8 border-2 border-dashed border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment-dark)] p-12 text-center">
          <p className="text-[var(--ink-light)] italic">
            No documents uploaded yet for {character.name}.
          </p>
        </div>
      )}
    </div>
  );
}
