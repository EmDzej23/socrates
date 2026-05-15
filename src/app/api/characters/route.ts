import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const activeCharacters = await db
      .select({
        id: characters.id,
        name: characters.name,
        slug: characters.slug,
        description: characters.description,
        avatarUrl: characters.avatarUrl,
      })
      .from(characters)
      .where(eq(characters.active, true))
      .orderBy(asc(characters.sortOrder), asc(characters.name));

    return NextResponse.json(activeCharacters);
  } catch (error) {
    console.error("Get public characters error:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}
