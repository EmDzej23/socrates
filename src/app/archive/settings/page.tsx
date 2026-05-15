import { db } from "@/lib/db";
import { documents, documentChunks, chatSessions, chatMessages, rules, characters } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [docsResult] = await db.select({ count: count() }).from(documents);
  const [chunksResult] = await db.select({ count: count() }).from(documentChunks);
  const [sessionsResult] = await db.select({ count: count() }).from(chatSessions);
  const [messagesResult] = await db.select({ count: count() }).from(chatMessages);
  const [rulesResult] = await db.select({ count: count() }).from(rules);
  const [charactersResult] = await db.select({ count: count() }).from(characters);

  const stats = {
    characters: charactersResult?.count ?? 0,
    documents: docsResult?.count ?? 0,
    chunks: chunksResult?.count ?? 0,
    sessions: sessionsResult?.count ?? 0,
    messages: messagesResult?.count ?? 0,
    rules: rulesResult?.count ?? 0,
  };

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <h1 className="text-2xl font-semibold text-[var(--ink)]">
        Settings
      </h1>
      <p className="mt-1 text-[var(--ink-light)] italic">
        System configuration and statistics.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Archive Statistics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.characters}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Characters
              </p>
            </div>
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.documents}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Documents
              </p>
            </div>
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.chunks}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Chunks
              </p>
            </div>
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.rules}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Rules
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Chat Statistics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.sessions}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Chat Sessions
              </p>
            </div>
            <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
              <p className="text-3xl font-bold text-[var(--ink)]">
                {stats.messages}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-light)]">
                Messages
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Environment
          </h2>
          <div className="mt-4 border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--ink-light)]">Chat Model</dt>
                <dd className="font-mono text-[var(--ink)]">
                  {process.env.AI_CHAT_MODEL || "claude-sonnet-4-6"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-light)]">Embedding Model</dt>
                <dd className="font-mono text-[var(--ink)]">
                  {process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-light)]">Max Retrieved Chunks</dt>
                <dd className="font-mono text-[var(--ink)]">
                  {process.env.MAX_RETRIEVED_CHUNKS || "10"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-light)]">Max Chat History</dt>
                <dd className="font-mono text-[var(--ink)]">
                  {process.env.MAX_CHAT_HISTORY_MESSAGES || "8"}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
