import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { z } from "zod";
import { ingestDocument } from "@/lib/archive/ingest";

const createDocumentSchema = z.object({
  characterId: z.string().uuid(),
  title: z.string().min(1),
  author: z.string().optional(),
  translator: z.string().optional(),
  sourceType: z.enum([
    "primary_source",
    "secondary_source",
    "biography",
    "academic_commentary",
    "admin_interpretation",
    "behavior_rule",
    "system_note",
    "translation_note",
  ]),
  reliability: z.enum(["high", "medium", "low", "experimental"]).default("medium"),
  language: z.string().default("en"),
  originalLanguage: z.string().optional(),
  period: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  publicationYear: z.string().optional(),
  copyrightStatus: z.string().optional(),
  notes: z.string().optional(),
  rawContent: z.string().min(1),
  processImmediately: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createDocumentSchema.parse(body);

    const [doc] = await db
      .insert(documents)
      .values({
        characterId: validated.characterId,
        title: validated.title,
        author: validated.author || null,
        translator: validated.translator || null,
        sourceType: validated.sourceType,
        reliability: validated.reliability,
        language: validated.language,
        originalLanguage: validated.originalLanguage || null,
        period: validated.period || null,
        sourceUrl: validated.sourceUrl || null,
        publicationYear: validated.publicationYear || null,
        copyrightStatus: validated.copyrightStatus || null,
        notes: validated.notes || null,
        rawContent: validated.rawContent,
        processingStatus: "pending",
      })
      .returning();

    if (validated.processImmediately) {
      await ingestDocument(doc.id);
    }

    return NextResponse.json({
      documentId: doc.id,
      status: validated.processImmediately ? "processed" : "pending",
    });
  } catch (error) {
    console.error("Create document error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
