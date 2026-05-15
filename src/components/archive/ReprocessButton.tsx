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
    <div style={{ fontFamily: 'var(--font-serif)' }}>
      <button
        onClick={handleReprocess}
        disabled={isProcessing}
        className="bg-[var(--ink)] px-4 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] disabled:opacity-50 transition-colors"
      >
        {isProcessing ? "Processing..." : "Reprocess"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-[var(--terracotta)]">{error}</p>
      )}
    </div>
  );
}
