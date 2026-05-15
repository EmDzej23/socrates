import Link from "next/link";

export default function ArchiveDashboard() {
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
          href="/archive/documents"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">📜</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Documents
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Add, edit, and process source documents for the archive.
          </p>
        </Link>

        <Link
          href="/archive/chunks"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">✂</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Chunks
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Review processed text fragments and their embeddings.
          </p>
        </Link>

        <Link
          href="/archive/rules"
          className="group border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6 hover:border-[var(--ink)] transition-colors"
        >
          <div className="text-2xl mb-3">⚖</div>
          <h2 className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Socratic Rules
          </h2>
          <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Configure behavioral guidelines for philosophical dialogue.
          </p>
        </Link>
      </div>
    </div>
  );
}
