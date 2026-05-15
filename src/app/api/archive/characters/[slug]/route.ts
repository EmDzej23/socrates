import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { characters, documents, rules } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";

const updateCharacterSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullish(),
  avatarUrl: z.string().url().nullish().or(z.literal("")),
  basePrompt: z.string().nullish(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.slug, slug))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const [docCount] = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.characterId, character.id));

    const [ruleCount] = await db
      .select({ count: count() })
      .from(rules)
      .where(eq(rules.characterId, character.id));

    return NextResponse.json({
      ...character,
      documentCount: docCount?.count || 0,
      ruleCount: ruleCount?.count || 0,
    });
  } catch (error) {
    console.error("Get character error:", error);
    return NextResponse.json({ error: "Failed to fetch character" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const validated = updateCharacterSchema.parse(body);

    const [existing] = await db
      .select()
      .from(characters)
      .where(eq(characters.slug, slug))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(characters)
      .set({
        ...validated,
        avatarUrl: validated.avatarUrl === "" ? null : validated.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(characters.id, existing.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update character error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update character" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const [existing] = await db
      .select()
      .from(characters)
      .where(eq(characters.slug, slug))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    await db.delete(characters).where(eq(characters.id, existing.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete character error:", error);
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 });
  }
}
