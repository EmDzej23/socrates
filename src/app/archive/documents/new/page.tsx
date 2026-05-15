import Link from "next/link";
import { DocumentForm } from "@/components/archive/DocumentForm";

export default function NewDocumentPage() {
  return (
    <div className="p-8" style={{ fontFamily: 'var(--font-serif)' }}>
      <Link
        href="/archive/documents"
        className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)] italic"
      >
        ← Back to documents
      </Link>
      
      <h1 className="mt-4 text-3xl font-semibold text-[var(--ink)]">
        Add Document
      </h1>
      <p className="mt-2 text-[var(--ink-light)] italic">
        Add a new source document to the archive.
      </p>

      <div className="mt-8 max-w-2xl">
        <DocumentForm />
      </div>
    </div>
  );
}
