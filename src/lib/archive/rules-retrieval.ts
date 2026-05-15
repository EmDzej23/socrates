import { db } from "@/lib/db";
import { rules } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { createEmbedding } from "@/lib/ai/embeddings";
import type { Rule } from "@/lib/db/schema";

const MAX_CONTEXTUAL_RULES = 3;

export async function getRelevantRules(query: string, characterId: string): Promise<Rule[]> {
  const alwaysIncludeRules = await db
    .select()
    .from(rules)
    .where(and(
      eq(rules.characterId, characterId),
      eq(rules.active, true),
      eq(rules.alwaysInclude, true)
    ))
    .orderBy(rules.priority);

  const contextualRulesWithEmbeddings = await db
    .select()
    .from(rules)
    .where(and(
      eq(rules.characterId, characterId),
      eq(rules.active, true),
      eq(rules.alwaysInclude, false)
    ));

  if (contextualRulesWithEmbeddings.length === 0) {
    return alwaysIncludeRules;
  }

  const rulesWithEmbeddings = contextualRulesWithEmbeddings.filter(r => r.embedding);

  if (rulesWithEmbeddings.length === 0) {
    return [...alwaysIncludeRules, ...contextualRulesWithEmbeddings.slice(0, MAX_CONTEXTUAL_RULES)];
  }

  const queryEmbedding = await createEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const relevantRules = await db.execute(sql`
    SELECT
      id,
      character_id,
      title,
      content,
      active,
      always_include,
      priority,
      created_at,
      updated_at,
      1 - (embedding <=> ${embeddingString}::vector) AS similarity
    FROM rules
    WHERE character_id = ${characterId}
      AND active = true
      AND always_include = false
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${MAX_CONTEXTUAL_RULES}
  `);

  const contextualRules = (relevantRules.rows as unknown[]).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      characterId: r.character_id as string,
      title: r.title as string,
      content: r.content as string,
      active: r.active as boolean,
      alwaysInclude: r.always_include as boolean,
      priority: r.priority as number,
      embedding: null,
      createdAt: r.created_at as Date,
      updatedAt: r.updated_at as Date,
    } as Rule;
  });

  const allRules = [...alwaysIncludeRules, ...contextualRules];
  allRules.sort((a, b) => a.priority - b.priority);

  return allRules;
}

export async function embedRule(ruleId: string): Promise<void> {
  const [rule] = await db
    .select()
    .from(rules)
    .where(eq(rules.id, ruleId))
    .limit(1);

  if (!rule) return;

  const textToEmbed = `${rule.title}: ${rule.content}`;
  const embedding = await createEmbedding(textToEmbed);

  await db
    .update(rules)
    .set({ embedding, updatedAt: new Date() })
    .where(eq(rules.id, ruleId));
}
