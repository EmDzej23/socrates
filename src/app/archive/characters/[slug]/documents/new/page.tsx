import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DocumentForm } from "@/components/archive/DocumentForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewDocumentPage({ params }: PageProps) {
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
        <div className="text-sm text-[var(--ink-light)]">
          <Link href={`/archive/characters/${slug}`} className="hover:text-[var(--ink)]">
            {character.name}
          </Link>
          {" / "}
          <Link href={`/archive/characters/${slug}/documents`} className="hover:text-[var(--ink)]">
            Documents
          </Link>
          {" / "}
        </div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">New Document</h1>
        <p className="mt-1 text-[var(--ink-light)] italic">
          Add a new source document for {character.name}.
        </p>
      </div>

      <div className="max-w-3xl">
        <DocumentForm characterId={character.id} characterSlug={slug} />
      </div>
    </div>
  );
}
