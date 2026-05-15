import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CharacterForm } from "@/components/archive/CharacterForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCharacterPage({ params }: PageProps) {
  const { slug } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Edit {character.name}</h1>
        <p className="mt-1 text-[var(--ink-light)] italic">
          Update the character's profile and settings.
        </p>
      </div>

      <div className="max-w-2xl">
        <CharacterForm character={character} />
      </div>
    </div>
  );
}
