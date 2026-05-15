import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { retrieveRelevantChunks } from "@/lib/archive/retrieval";

const retrievalTestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = retrievalTestSchema.parse(body);

    const chunks = await retrieveRelevantChunks({
      query: validated.query,
      limit: validated.limit || 10,
    });

    return NextResponse.json({ chunks });
  } catch (error) {
    console.error("Retrieval test error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve chunks" },
      { status: 500 }
    );
  }
}
