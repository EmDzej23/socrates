import { db } from "@/lib/db";
import { socraticRules } from "@/lib/db/schema";
import { RuleEditor } from "@/components/archive/RuleEditor";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await db
    .select()
    .from(socraticRules)
    .orderBy(socraticRules.priority);

  return (
    <div className="p-8" style={{ fontFamily: 'var(--font-serif)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">
            Socratic Rules
          </h1>
          <p className="mt-1 text-[var(--ink-light)] italic">
            Configure behavioral rules for the Socratic dialogue system.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <RuleEditor rules={rules} />
      </div>
    </div>
  );
}
