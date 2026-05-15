"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ReprocessButtonProps = {
  documentId: string;
};

export function ReprocessButton({ documentId }: ReprocessButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReprocess = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/archive/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, reprocess: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process document");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleReprocess}
        disabled={isProcessing}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {isProcessing ? "Processing..." : "Reprocess"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
