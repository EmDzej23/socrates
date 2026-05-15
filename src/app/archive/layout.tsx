import Link from "next/link";

export const metadata = {
  title: "Archive — Σωκράτης",
  description: "Manage the knowledge archive.",
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment-dark)]">
        <div className="p-6 border-b-2 border-[var(--ink-light)] border-opacity-20">
          <Link href="/archive" className="flex items-center gap-3">
            <span className="text-xl text-[var(--ink-light)]">📜</span>
            <div>
              <span className="text-xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
                Archive
              </span>
              <p className="text-xs text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                τὸ ἀρχεῖον
              </p>
            </div>
          </Link>
        </div>
        <nav className="px-4 py-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/archive/characters"
                className="block px-4 py-3 text-[var(--ink)] hover:bg-[var(--parchment)] transition-colors font-semibold"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Characters
              </Link>
            </li>
            <li>
              <Link
                href="/archive/chunks"
                className="block px-4 py-3 text-[var(--ink)] hover:bg-[var(--parchment)] transition-colors"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                All Chunks
              </Link>
            </li>
            <li>
              <Link
                href="/archive/settings"
                className="block px-4 py-3 text-[var(--ink)] hover:bg-[var(--parchment)] transition-colors"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 border-t-2 border-[var(--ink-light)] border-opacity-20 p-4">
          <Link
            href="/"
            className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)] italic"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            ← Return to Agora
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[var(--parchment)] papyrus-texture">{children}</main>
    </div>
  );
}
