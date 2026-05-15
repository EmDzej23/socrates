import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestDocument } from "@/lib/archive/ingest";

const ingestSchema = z.object({
  documentId: z.string().uuid(),
  reprocess: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ingestSchema.parse(body);

    const result = await ingestDocument(validated.documentId, validated.reprocess);

    return NextResponse.json({
      documentId: validated.documentId,
      chunkCount: result.chunkCount,
      status: "processed",
    });
  } catch (error) {
    console.error("Ingest error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to ingest document" },
      { status: 500 }
    );
  }
}
