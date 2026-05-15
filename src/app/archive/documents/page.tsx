import Link from "next/link";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const docs = await db
    .select()
    .from(documents)
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-8" style={{ fontFamily: 'var(--font-serif)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">
            Documents
          </h1>
          <p className="mt-1 text-[var(--ink-light)] italic">
            {docs.length} documents in the archive
          </p>
        </div>
        <Link
          href="/archive/documents/new"
          className="bg-[var(--ink)] px-5 py-3 text-[var(--parchment)] hover:bg-[var(--ink-light)] transition-colors"
        >
          Add Document
        </Link>
      </div>

      <div className="mt-8">
        {docs.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment-dark)] p-12 text-center">
            <p className="text-[var(--ink-light)] italic">
              No documents yet. Add your first source document to begin building the archive.
            </p>
            <Link
              href="/archive/documents/new"
              className="mt-4 inline-block text-[var(--ink)] underline"
            >
              Add your first document
            </Link>
          </div>
        ) : (
          <div className="border-2 border-[var(--ink-light)] border-opacity-20">
            <table className="min-w-full">
              <thead className="bg-[var(--parchment-dark)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-[var(--ink-light)] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-[var(--ink-light)] uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-[var(--ink-light)] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-[var(--ink-light)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-[var(--ink-light)] uppercase tracking-wider">
                    Chunks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ink-light)] divide-opacity-10 bg-[var(--parchment)]">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[var(--parchment-dark)] transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/archive/documents/${doc.id}`}
                        className="font-medium text-[var(--ink)] hover:underline"
                      >
                        {doc.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[var(--ink-light)]">
                      {doc.author || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[var(--parchment-dark)] px-2 py-1 text-xs text-[var(--ink-light)]">
                        {doc.sourceType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs ${
                          doc.processingStatus === "processed"
                            ? "bg-[var(--olive)] text-[var(--parchment)]"
                            : doc.processingStatus === "processing"
                            ? "bg-[var(--gold)] text-[var(--parchment)]"
                            : doc.processingStatus === "failed"
                            ? "bg-[var(--terracotta)] text-[var(--parchment)]"
                            : "bg-[var(--ink-light)] text-[var(--parchment)]"
                        }`}
                      >
                        {doc.processingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--ink-light)]">
                      {doc.chunkCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
