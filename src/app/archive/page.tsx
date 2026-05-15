import Link from "next/link";

export default function ArchiveDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium text-stone-800 dark:text-stone-200">
        Archive Dashboard
      </h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Manage your Socratic knowledge base.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/archive/documents"
          className="rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
        >
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Documents
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Add, edit, and process source documents for the archive.
          </p>
        </Link>

        <Link
          href="/archive/chunks"
          className="rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
        >
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Chunks
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Review processed text chunks and their embeddings.
          </p>
        </Link>

        <Link
          href="/archive/rules"
          className="rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
        >
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Socratic Rules
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Configure behavioral rules for Socratic dialogue.
          </p>
        </Link>
      </div>
    </div>
  );
}
