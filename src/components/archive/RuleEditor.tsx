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

      setNewRule({ title: "", content: "", priority: 100, active: true });
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          Add Rule
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <h3 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            New Rule
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Title
              </label>
              <input
                type="text"
                value={newRule.title}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="e.g., No direct identity claim"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Content
              </label>
              <textarea
                value={newRule.content}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={3}
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                placeholder="Describe the rule behavior..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Priority (lower = higher priority)
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
                  className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRule.active}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    Active
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddRule}
                disabled={isSaving}
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                {isSaving ? "Saving..." : "Save Rule"}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-700 dark:bg-stone-900">
          <p className="text-stone-600 dark:text-stone-400">
            No rules configured yet. Add behavioral rules to guide Socratic
            dialogue.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-xl border bg-white p-6 dark:bg-stone-900 ${
                rule.active
                  ? "border-stone-200 dark:border-stone-800"
                  : "border-stone-200 opacity-60 dark:border-stone-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-stone-800 dark:text-stone-200">
                      {rule.title}
                    </h3>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                      Priority: {rule.priority}
                    </span>
                    {!rule.active && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    {rule.content}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className="rounded px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  >
                    {rule.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
