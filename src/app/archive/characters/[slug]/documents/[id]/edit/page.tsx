import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { characters, documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DocumentForm } from "@/components/archive/DocumentForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function EditDocumentPage({ params }: PageProps) {
  const { slug, id } = await params;

  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.slug, slug))
    .limit(1);

  if (!character) {
    notFound();
  }

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!document || document.characterId !== character.id) {
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
          <Link href={`/archive/characters/${slug}/documents/${id}`} className="hover:text-[var(--ink)]">
            {document.title}
          </Link>
          {" / "}
        </div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Edit Document</h1>
      </div>

      <div className="max-w-3xl">
        <DocumentForm document={document} characterId={character.id} characterSlug={slug} />
      </div>
    </div>
  );
}
