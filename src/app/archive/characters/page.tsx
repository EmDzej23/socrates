import Link from "next/link";
import { db } from "@/lib/db";
import { characters, documents, rules } from "@/lib/db/schema";
import { asc, eq, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const allCharacters = await db
    .select({
      id: characters.id,
      name: characters.name,
      slug: characters.slug,
      description: characters.description,
      active: characters.active,
      sortOrder: characters.sortOrder,
      createdAt: characters.createdAt,
    })
    .from(characters)
    .orderBy(asc(characters.sortOrder), asc(characters.name));

  const characterStats = await Promise.all(
    allCharacters.map(async (char) => {
      const [docCount] = await db
        .select({ count: count() })
        .from(documents)
        .where(eq(documents.characterId, char.id));
      const [ruleCount] = await db
        .select({ count: count() })
        .from(rules)
        .where(eq(rules.characterId, char.id));
      return {
        ...char,
        documentCount: docCount?.count || 0,
        ruleCount: ruleCount?.count || 0,
      };
    })
  );

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Characters</h1>
          <p className="mt-1 text-[var(--ink-light)] italic">
            Manage the philosophers and personas available for dialogue.
          </p>
        </div>
        <Link
          href="/archive/characters/new"
          className="bg-[var(--ink)] px-4 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] transition-colors"
        >
          Add Character
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {characterStats.map((char) => (
          <Link
            key={char.id}
            href={`/archive/characters/${char.slug}`}
            className={`block border-2 bg-[var(--parchment)] p-6 transition-colors hover:border-[var(--ink)] ${
              char.active
                ? "border-[var(--ink-light)] border-opacity-20"
                : "border-[var(--ink-light)] border-opacity-10 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-[var(--ink)]">{char.name}</h2>
              {!char.active && (
                <span className="bg-[var(--terracotta)] px-2 py-0.5 text-xs text-[var(--parchment)]">
                  Inactive
                </span>
              )}
            </div>
            {char.description && (
              <p className="mt-2 text-sm text-[var(--ink-light)] line-clamp-2">
                {char.description}
              </p>
            )}
            <div className="mt-4 flex gap-4 text-xs text-[var(--ink-light)]">
              <span>{char.documentCount} documents</span>
              <span>{char.ruleCount} rules</span>
            </div>
          </Link>
        ))}
      </div>

      {allCharacters.length === 0 && (
        <div className="mt-8 border-2 border-dashed border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment-dark)] p-12 text-center">
          <p className="text-[var(--ink-light)] italic">
            No characters created yet. Add your first philosopher to begin.
          </p>
        </div>
      )}
    </div>
  );
}
