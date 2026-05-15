"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SocraticRule } from "@/lib/db/schema";

type RuleEditorProps = {
  rules: SocraticRule[];
};

export function RuleEditor({ rules: initialRules }: RuleEditorProps) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [newRule, setNewRule] = useState({
    title: "",
    content: "",
    priority: 100,
    active: true,
    alwaysInclude: true,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRule = async () => {
    if (!newRule.title.trim() || !newRule.content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/archive/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) throw new Error("Failed to add rule");

      setNewRule({ title: "", content: "", priority: 100, active: true, alwaysInclude: true });
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      console.error("Add rule error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (rule: SocraticRule) => {
    try {
      const response = await fetch(`/api/archive/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !rule.active }),
      });

      if (!response.ok) throw new Error("Failed to update rule");

      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r))
      );
    } catch (error) {
      console.error("Toggle rule error:", error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const response = await fetch(`/api/archive/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete rule");

      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (error) {
      console.error("Delete rule error:", error);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-serif)' }}>
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[var(--ink)] px-4 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] transition-colors"
        >
          Add Rule
        </button>
      </div>

      {isAdding && (
        <div className="border-2 border-[var(--ink-light)] border-opacity-20 bg-[var(--parchment)] p-6">
          <h3 className="text-xl font-semibold text-[var(--ink)]">
            New Rule
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={newRule.title}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                placeholder="e.g., No direct identity claim"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
                Content
              </label>
              <textarea
                value={newRule.content}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={3}
                className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                placeholder="Describe the rule behavior..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider">
                  Priority (lower = higher)
                </label>
                <input
                  type="number"
                  value={newRule.priority}
                  onChange={(e) =>
                    setNewRule((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value, 10) || 100,
                    }))
                  }
                  className="mt-1 block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-2 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                />
              </div>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRule.active}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, active: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[var(--ink)]">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRule.alwaysInclude}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, alwaysInclude: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[var(--ink)]">Always include</span>
                </label>
              </div>
            </div>
            <p className="text-xs text-[var(--ink-light)] italic">
              "Always include" rules are sent with every prompt. Contextual rules are retrieved based on relevance to the question.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddRule}
                disabled={isSaving}
                className="bg-[var(--ink)] px-4 py-2 text-[var(--parchment)] hover:bg-[var(--ink-light)] disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Saving..." : "Save Rule"}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="border-2 border-[var(--ink-light)] border-opacity-30 px-4 py-2 text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment-dark)] p-12 text-center">
          <p className="text-[var(--ink-light)] italic">
            No rules configured yet. Add behavioral rules to guide Socratic dialogue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`border-2 bg-[var(--parchment)] p-6 ${
                rule.active
                  ? "border-[var(--ink-light)] border-opacity-20"
                  : "border-[var(--ink-light)] border-opacity-10 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--ink)]">
                      {rule.title}
                    </h3>
                    <span className="bg-[var(--parchment-dark)] px-2 py-0.5 text-xs text-[var(--ink-light)]">
                      Priority: {rule.priority}
                    </span>
                    {rule.alwaysInclude ? (
                      <span className="bg-[var(--olive)] px-2 py-0.5 text-xs text-[var(--parchment)]">
                        Always
                      </span>
                    ) : (
                      <span className="bg-[var(--gold)] px-2 py-0.5 text-xs text-[var(--parchment)]">
                        Contextual
                      </span>
                    )}
                    {!rule.active && (
                      <span className="bg-[var(--terracotta)] px-2 py-0.5 text-xs text-[var(--parchment)]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[var(--ink-light)]">
                    {rule.content}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className="px-2 py-1 text-xs text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors"
                  >
                    {rule.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="px-2 py-1 text-xs text-[var(--terracotta)] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
