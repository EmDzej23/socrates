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
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-stone-800 dark:text-stone-200">
            Documents
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {docs.length} documents in the archive
          </p>
        </div>
        <Link
          href="/archive/documents/new"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Add Document
        </Link>
      </div>

      <div className="mt-8">
        {docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-700 dark:bg-stone-900">
            <p className="text-stone-600 dark:text-stone-400">
              No documents yet. Add your first source document to begin building the archive.
            </p>
            <Link
              href="/archive/documents/new"
              className="mt-4 inline-block text-sm font-medium text-stone-900 underline dark:text-stone-100"
            >
              Add your first document
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
              <thead className="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                    Chunks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-800 dark:bg-stone-950">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50 dark:hover:bg-stone-900">
                    <td className="px-6 py-4">
                      <Link
                        href={`/archive/documents/${doc.id}`}
                        className="font-medium text-stone-900 hover:underline dark:text-stone-100"
                      >
                        {doc.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
                      {doc.author || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {doc.sourceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          doc.processingStatus === "processed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : doc.processingStatus === "processing"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : doc.processingStatus === "failed"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        {doc.processingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">
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
