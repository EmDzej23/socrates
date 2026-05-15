import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { characters, rules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { RuleEditor } from "@/components/archive/RuleEditor";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CharacterRulesPage({ params }: PageProps) {
  const { slug } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  const characterRules = await db
    .select()
    .from(rules)
    .where(eq(rules.characterId, character.id))
    .orderBy(rules.priority);

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[var(--ink-light)]">
            <Link href={`/archive/characters/${slug}`} className="hover:text-[var(--ink)]">
              {character.name}
            </Link>
            {" / "}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Rules</h1>
          <p className="mt-1 text-[var(--ink-light)] italic">
            Behavioral guidelines for {character.name}'s dialogue.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <RuleEditor rules={characterRules} characterId={character.id} />
      </div>
    </div>
  );
}
