import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DocumentForm } from "@/components/archive/DocumentForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDocumentPage({ params }: Props) {
  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link
        href={`/archive/documents/${id}`}
        className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)] italic"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        ← Back to document
      </Link>
      
      <h1 className="mt-4 text-2xl font-semibold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
        Edit Document
      </h1>
      <p className="mt-2 text-[var(--ink-light)]" style={{ fontFamily: 'var(--font-serif)' }}>
        Update "{doc.title}"
      </p>

      <div className="mt-8 max-w-2xl">
        <DocumentForm
          initialData={{
            id: doc.id,
            title: doc.title,
            author: doc.author || "",
            translator: doc.translator || "",
            sourceType: doc.sourceType,
            reliability: doc.reliability,
            language: doc.language,
            originalLanguage: doc.originalLanguage || "",
            period: doc.period || "",
            sourceUrl: doc.sourceUrl || "",
            publicationYear: doc.publicationYear || "",
            copyrightStatus: doc.copyrightStatus || "",
            notes: doc.notes || "",
            rawContent: doc.rawContent,
          }}
        />
      </div>
    </div>
  );
}
