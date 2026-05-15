import { DocumentForm } from "@/components/archive/DocumentForm";

export default function NewDocumentPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium text-stone-800 dark:text-stone-200">
        Add Document
      </h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Add a new source document to the archive.
      </p>

      <div className="mt-8 max-w-2xl">
        <DocumentForm />
      </div>
    </div>
  );
}
