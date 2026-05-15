"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Character } from "@/lib/db/schema";

type CharacterFormProps = {
  character?: Character;
};

export function CharacterForm({ character }: CharacterFormProps) {
  const router = useRouter();
  const isEditing = !!character;

  const [formData, setFormData] = useState({
    name: character?.name || "",
    slug: character?.slug || "",
    description: character?.description || "",
    avatarUrl: character?.avatarUrl || "",
    basePrompt: character?.basePrompt || "",
    greetingMessage: character?.greetingMessage || "",
    active: character?.active ?? true,
    sortOrder: character?.sortOrder ?? 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/archive/characters/${character.slug}`
        : "/api/archive/characters";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save character");
      }

      const saved = await response.json();
      router.push(`/archive/characters/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ fontFamily: "var(--font-serif)" }}>
      {error && (
        <div className="border-2 border-[var(--terracotta)] bg-[var(--terracotta)] bg-opacity-10 p-4 text-[var(--terracotta)]">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
            placeholder="e.g., Aristotle"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            required
            pattern="^[a-z0-9-]+$"
            className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none font-mono"
            placeholder="e.g., aristotle"
          />
          <p className="mt-1 text-xs text-[var(--ink-light)]">
            URL-friendly identifier (lowercase, hyphens only)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
          placeholder="A brief description of this character..."
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
          Base System Prompt
        </label>
        <textarea
          value={formData.basePrompt}
          onChange={(e) => setFormData((prev) => ({ ...prev, basePrompt: e.target.value }))}
          rows={4}
          className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
          placeholder="The foundational system prompt for this character..."
        />
        <p className="mt-1 text-xs text-[var(--ink-light)]">
          This prompt forms the foundation of the character's identity. Rules and documents are added on top.
        </p>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
          Greeting Message
        </label>
        <input
          type="text"
          value={formData.greetingMessage}
          onChange={(e) => setFormData((prev) => ({ ...prev, greetingMessage: e.target.value }))}
          className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
          placeholder="e.g., Let us begin with care, friend. What question weighs upon your mind?"
        />
        <p className="mt-1 text-xs text-[var(--ink-light)]">
          The first message users see when starting a conversation. Leave empty for default.
        </p>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
          Avatar URL
        </label>
        <input
          type="url"
          value={formData.avatarUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
          className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
            className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[var(--ink-light)]">
            Lower numbers appear first in the list
          </p>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-[var(--ink)]">Active (visible to users)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--ink)] px-6 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Character" : "Create Character"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border-2 border-[var(--ink-light)] border-opacity-30 px-6 py-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
