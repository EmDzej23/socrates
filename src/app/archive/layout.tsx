import Link from "next/link";

export const metadata = {
  title: "Archive — Socrates Admin",
  description: "Manage the Socratic knowledge archive.",
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
        <div className="p-6">
          <Link href="/archive" className="text-lg font-medium text-stone-800 dark:text-stone-200">
            Archive
          </Link>
          <p className="text-xs text-stone-500 mt-1">Admin Panel</p>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/archive/documents"
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Documents
              </Link>
            </li>
            <li>
              <Link
                href="/archive/chunks"
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Chunks
              </Link>
            </li>
            <li>
              <Link
                href="/archive/rules"
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Socratic Rules
              </Link>
            </li>
            <li>
              <Link
                href="/archive/settings"
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 border-t border-stone-200 p-4 dark:border-stone-800">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
