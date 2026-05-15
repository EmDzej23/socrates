"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sourceTypes, reliabilityLevels } from "@/lib/db/schema";

type DocumentFormProps = {
  initialData?: {
    id?: string;
    title: string;
    author: string;
    translator: string;
    sourceType: string;
    reliability: string;
    language: string;
    originalLanguage: string;
    period: string;
    sourceUrl: string;
    publicationYear: string;
    copyrightStatus: string;
    notes: string;
    rawContent: string;
  };
};

export function DocumentForm({ initialData }: DocumentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    translator: initialData?.translator || "",
    sourceType: initialData?.sourceType || "primary_source",
    reliability: initialData?.reliability || "medium",
    language: initialData?.language || "en",
    originalLanguage: initialData?.originalLanguage || "",
    period: initialData?.period || "",
    sourceUrl: initialData?.sourceUrl || "",
    publicationYear: initialData?.publicationYear || "",
    copyrightStatus: initialData?.copyrightStatus || "",
    notes: initialData?.notes || "",
    rawContent: initialData?.rawContent || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, processImmediately = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = initialData?.id
        ? `/api/archive/documents/${initialData.id}`
        : "/api/archive/documents";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, processImmediately }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save document");
      }

      const data = await response.json();
      router.push(`/archive/documents/${data.documentId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., Apology"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Author
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., Plato"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Translator
          </label>
          <input
            type="text"
            name="translator"
            value={formData.translator}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., Benjamin Jowett"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Source Type *
          </label>
          <select
            name="sourceType"
            value={formData.sourceType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Reliability *
          </label>
          <select
            name="reliability"
            value={formData.reliability}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          >
            {reliabilityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Language
          </label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="en"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Original Language
          </label>
          <input
            type="text"
            name="originalLanguage"
            value={formData.originalLanguage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., Ancient Greek"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Period
          </label>
          <input
            type="text"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., 399 BCE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Publication Year
          </label>
          <input
            type="text"
            name="publicationYear"
            value={formData.publicationYear}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., 1871"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Source URL
          </label>
          <input
            type="url"
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="https://..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Copyright Status
          </label>
          <input
            type="text"
            name="copyrightStatus"
            value={formData.copyrightStatus}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="e.g., Public Domain"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="Any relevant notes about this source..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Content *
          </label>
          <textarea
            name="rawContent"
            value={formData.rawContent}
            onChange={handleChange}
            required
            rows={12}
            className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 font-mono text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            placeholder="Paste the full text content here..."
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {isSubmitting ? "Saving..." : "Save Document"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
          className="rounded-lg border border-stone-300 bg-white px-6 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {isSubmitting ? "Processing..." : "Save & Process"}
        </button>
      </div>
    </form>
  );
}
