import Link from "next/link";
import { db } from "@/lib/db";
import { characters, documents, rules } from "@/lib/db/schema";
import { count, asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ArchiveDashboard() {
  const allCharacters = await db
    .select({
      id: characters.id,
      name: characters.name,
      slug: characters.slug,
      description: characters.description,
      active: characters.active,
    })
    .from(characters)
    .orderBy(asc(characters.sortOrder), asc(characters.name))
    .limit(6);

  const [totalDocs] = await db.select({ count: count() }).from(documents);
  const [totalRules] = await db.select({ count: count() }).from(rules);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">☉</span>
        <h1 className="text-3xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
          Archive Dashboard
        </h1>
      </div>
      <p className="text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
        Curate and manage the knowledge of the ages.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/archive/characters"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">🏛</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Characters
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Manage philosophers and personas. Each has its own documents and rules.
          </p>
          <p className="mt-3 text-sm text-[var(--ink-light)]">
            {allCharacters.length} character{allCharacters.length !== 1 ? "s" : ""}
          </p>
        </Link>

        <Link
          href="/archive/chunks"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">✂</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            All Chunks
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Review processed text fragments and their embeddings across all characters.
          </p>
        </Link>

        <Link
          href="/archive/settings"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">⚙</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Settings
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Configure system settings and view statistics.
          </p>
        </Link>
      </div>

      {allCharacters.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
              Characters
            </h2>
            <Link
              href="/archive/characters"
              className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCharacters.map((char) => (
              <Link
                key={char.id}
                href={`/archive/characters/${char.slug}`}
                className={`block border-2 bg-[var(--parchment)] p-4 transition-colors hover:border-[var(--ink)] ${
                  char.active
                    ? "border-[var(--ink-light)] border-opacity-20"
                    : "border-[var(--ink-light)] border-opacity-10 opacity-60"
                }`}
              >
                <h3 className="font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {char.name}
                </h3>
                {char.description && (
                  <p className="mt-1 text-sm text-[var(--ink-light)] line-clamp-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    {char.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t-2 border-[var(--ink-light)] border-opacity-20 pt-6">
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Global Statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
            <div className="text-2xl font-bold text-[var(--ink)]">{allCharacters.length}</div>
            <div className="text-sm text-[var(--ink-light)]">Characters</div>
          </div>
          <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
            <div className="text-2xl font-bold text-[var(--ink)]">{totalDocs?.count || 0}</div>
            <div className="text-sm text-[var(--ink-light)]">Total Documents</div>
          </div>
          <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-4">
            <div className="text-2xl font-bold text-[var(--ink)]">{totalRules?.count || 0}</div>
            <div className="text-sm text-[var(--ink-light)]">Total Rules</div>
          </div>
        </div>
      </div>
    </div>
  );
}
