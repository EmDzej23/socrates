import { db } from "@/lib/db";
import { documents, documentChunks, chatSessions, chatMessages, socraticRules } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [docsResult] = await db.select({ count: count() }).from(documents);
  const [chunksResult] = await db.select({ count: count() }).from(documentChunks);
  const [sessionsResult] = await db.select({ count: count() }).from(chatSessions);
  const [messagesResult] = await db.select({ count: count() }).from(chatMessages);
  const [rulesResult] = await db.select({ count: count() }).from(socraticRules);

  const stats = {
    documents: docsResult?.count ?? 0,
    chunks: chunksResult?.count ?? 0,
    sessions: sessionsResult?.count ?? 0,
    messages: messagesResult?.count ?? 0,
    rules: rulesResult?.count ?? 0,
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium text-stone-800 dark:text-stone-200">
        Settings
      </h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        System configuration and statistics.
      </p>

      <div className="mt-8 space-y-8">
        <section>
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Archive Statistics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                {stats.documents}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Documents
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                {stats.chunks}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Chunks
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                {stats.rules}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Socratic Rules
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Chat Statistics
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                {stats.sessions}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Chat Sessions
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
                {stats.messages}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Messages
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Environment
          </h2>
          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600 dark:text-stone-400">Chat Model</dt>
                <dd className="font-mono text-stone-900 dark:text-stone-100">
                  {process.env.AI_CHAT_MODEL || "gpt-4.1-mini"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600 dark:text-stone-400">Embedding Model</dt>
                <dd className="font-mono text-stone-900 dark:text-stone-100">
                  {process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600 dark:text-stone-400">Max Retrieved Chunks</dt>
                <dd className="font-mono text-stone-900 dark:text-stone-100">
                  {process.env.MAX_RETRIEVED_CHUNKS || "10"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600 dark:text-stone-400">Max Chat History</dt>
                <dd className="font-mono text-stone-900 dark:text-stone-100">
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
