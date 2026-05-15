import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { characters, documents, rules } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CharacterDashboardPage({ params }: PageProps) {
  const { slug } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  const [docCount] = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.characterId, character.id));

  const [ruleCount] = await db
    .select({ count: count() })
    .from(rules)
    .where(eq(rules.characterId, character.id));

  const recentDocs = await db
    .select({
      id: documents.id,
      title: documents.title,
      processingStatus: documents.processingStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.characterId, character.id))
    .orderBy(desc(documents.createdAt))
    .limit(5);

  const recentRules = await db
    .select({
      id: rules.id,
      title: rules.title,
      active: rules.active,
      alwaysInclude: rules.alwaysInclude,
    })
    .from(rules)
    .where(eq(rules.characterId, character.id))
    .orderBy(rules.priority)
    .limit(5);

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--ink)]">{character.name}</h1>
            {!character.active && (
              <span className="bg-[var(--terracotta)] px-2 py-0.5 text-xs text-[var(--parchment)]">
                Inactive
              </span>
            )}
          </div>
          {character.description && (
            <p className="mt-1 text-[var(--ink-light)] italic">{character.description}</p>
          )}
        </div>
        <Link
          href={`/archive/characters/${slug}/edit`}
          className="border-2 border-[var(--ink-light)] border-opacity-30 px-4 py-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
        >
          Edit Character
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link
          href={`/archive/characters/${slug}/documents`}
          className="block border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <h2 className="text-lg font-semibold text-[var(--ink)]">Documents</h2>
          <p className="mt-1 text-3xl font-bold text-[var(--ink)]">{docCount?.count || 0}</p>
          <p className="mt-2 text-sm text-[var(--ink-light)]">
            Source texts and reference materials
          </p>
        </Link>

        <Link
          href={`/archive/characters/${slug}/rules`}
          className="block border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <h2 className="text-lg font-semibold text-[var(--ink)]">Rules</h2>
          <p className="mt-1 text-3xl font-bold text-[var(--ink)]">{ruleCount?.count || 0}</p>
          <p className="mt-2 text-sm text-[var(--ink-light)]">
            Behavioral guidelines for dialogue
          </p>
        </Link>
      </div>

      {character.basePrompt && (
        <div className="mt-8 border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Base Prompt</h2>
          <p className="mt-2 text-[var(--ink-light)] whitespace-pre-wrap">{character.basePrompt}</p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Recent Documents</h2>
            <Link
              href={`/archive/characters/${slug}/documents`}
              className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)]"
            >
              View all
            </Link>
          </div>
          {recentDocs.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {recentDocs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between">
                  <Link
                    href={`/archive/characters/${slug}/documents/${doc.id}`}
                    className="text-[var(--ink)] hover:underline truncate"
                  >
                    {doc.title}
                  </Link>
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
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[var(--ink-light)] italic">No documents yet</p>
          )}
        </div>

        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Recent Rules</h2>
            <Link
              href={`/archive/characters/${slug}/rules`}
              className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)]"
            >
              View all
            </Link>
          </div>
          {recentRules.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {recentRules.map((rule) => (
                <li key={rule.id} className="flex items-center justify-between">
                  <span className={`text-[var(--ink)] truncate ${!rule.active ? "opacity-50" : ""}`}>
                    {rule.title}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 ${
                      rule.alwaysInclude
                        ? "bg-[var(--olive)] text-[var(--parchment)]"
                        : "bg-[var(--gold)] text-[var(--parchment)]"
                    }`}
                  >
                    {rule.alwaysInclude ? "Always" : "Contextual"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[var(--ink-light)] italic">No rules yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
