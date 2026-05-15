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

  const inputClass = "mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none";
  const labelClass = "block text-sm text-[var(--ink-light)] uppercase tracking-wider";

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6" style={{ fontFamily: 'var(--font-serif)' }}>
      {error && (
        <div className="border-l-4 border-[var(--terracotta)] bg-[var(--parchment-dark)] p-4 text-[var(--terracotta)]">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="e.g., Apology"
          />
        </div>

        <div>
          <label className={labelClass}>Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Plato"
          />
        </div>

        <div>
          <label className={labelClass}>Translator</label>
          <input
            type="text"
            name="translator"
            value={formData.translator}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Benjamin Jowett"
          />
        </div>

        <div>
          <label className={labelClass}>Source Type *</label>
          <select
            name="sourceType"
            value={formData.sourceType}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Reliability *</label>
          <select
            name="reliability"
            value={formData.reliability}
            onChange={handleChange}
            required
            className={inputClass}
          >
            {reliabilityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Language</label>
          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className={inputClass}
            placeholder="en"
          />
        </div>

        <div>
          <label className={labelClass}>Original Language</label>
          <input
            type="text"
            name="originalLanguage"
            value={formData.originalLanguage}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Ancient Greek"
          />
        </div>

        <div>
          <label className={labelClass}>Period</label>
          <input
            type="text"
            name="period"
            value={formData.period}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., 399 BCE"
          />
        </div>

        <div>
          <label className={labelClass}>Publication Year</label>
          <input
            type="text"
            name="publicationYear"
            value={formData.publicationYear}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., 1871"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Source URL</label>
          <input
            type="url"
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Copyright Status</label>
          <input
            type="text"
            name="copyrightStatus"
            value={formData.copyrightStatus}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g., Public Domain"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            placeholder="Any relevant notes about this source..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Content *</label>
          <textarea
            name="rawContent"
            value={formData.rawContent}
            onChange={handleChange}
            required
            rows={12}
            className={`${inputClass} font-mono text-sm`}
            placeholder="Paste the full text content here..."
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--ink)] px-6 py-3 text-[var(--parchment)] hover:bg-[var(--ink-light)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Document" : "Save Document"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
          className="border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-6 py-3 text-[var(--ink)] hover:border-[var(--ink)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Processing..." : initialData?.id ? "Update & Reprocess" : "Save & Process"}
        </button>
      </div>
    </form>
  );
}
