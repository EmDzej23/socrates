import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ingestDocument } from "@/lib/archive/ingest";

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional(),
  translator: z.string().optional(),
  sourceType: z
    .enum([
      "primary_source",
      "secondary_source",
      "biography",
      "academic_commentary",
      "admin_interpretation",
      "behavior_rule",
      "system_note",
      "translation_note",
    ])
    .optional(),
  reliability: z.enum(["high", "medium", "low", "experimental"]).optional(),
  language: z.string().optional(),
  originalLanguage: z.string().optional(),
  period: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  publicationYear: z.string().optional(),
  copyrightStatus: z.string().optional(),
  notes: z.string().optional(),
  rawContent: z.string().min(1).optional(),
  processImmediately: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/archive/documents/[id]">
) {
  const { id } = await ctx.params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/archive/documents/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const validated = updateDocumentSchema.parse(body);

    const [existing] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.author !== undefined) updateData.author = validated.author || null;
    if (validated.translator !== undefined)
      updateData.translator = validated.translator || null;
    if (validated.sourceType !== undefined)
      updateData.sourceType = validated.sourceType;
    if (validated.reliability !== undefined)
      updateData.reliability = validated.reliability;
    if (validated.language !== undefined) updateData.language = validated.language;
    if (validated.originalLanguage !== undefined)
      updateData.originalLanguage = validated.originalLanguage || null;
    if (validated.period !== undefined) updateData.period = validated.period || null;
    if (validated.sourceUrl !== undefined)
      updateData.sourceUrl = validated.sourceUrl || null;
    if (validated.publicationYear !== undefined)
      updateData.publicationYear = validated.publicationYear || null;
    if (validated.copyrightStatus !== undefined)
      updateData.copyrightStatus = validated.copyrightStatus || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;
    if (validated.rawContent !== undefined)
      updateData.rawContent = validated.rawContent;

    const [doc] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    if (validated.processImmediately) {
      await ingestDocument(doc.id);
    }

    return NextResponse.json({
      documentId: doc.id,
      status: validated.processImmediately ? "processed" : doc.processingStatus,
    });
  } catch (error) {
    console.error("Update document error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/archive/documents/[id]">
) {
  try {
    const { id } = await ctx.params;

    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
