import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { z } from "zod";
import { asc } from "drizzle-orm";

const createCharacterSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  basePrompt: z.string().optional(),
  greetingMessage: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  try {
    const allCharacters = await db
      .select()
      .from(characters)
      .orderBy(asc(characters.sortOrder), asc(characters.name));
    return NextResponse.json(allCharacters);
  } catch (error) {
    console.error("Get characters error:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCharacterSchema.parse(body);

    const [character] = await db
      .insert(characters)
      .values({
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        avatarUrl: validated.avatarUrl || null,
        basePrompt: validated.basePrompt || null,
        greetingMessage: validated.greetingMessage || null,
        active: validated.active,
        sortOrder: validated.sortOrder,
      })
      .returning();

    return NextResponse.json(character);
  } catch (error) {
    console.error("Create character error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique constraint") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A character with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to create character" }, { status: 500 });
  }
}
