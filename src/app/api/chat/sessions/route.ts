import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { chatSessions, characters } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const sessions = await db
      .select({
        id: chatSessions.id,
        title: chatSessions.title,
        messageCount: chatSessions.messageCount,
        createdAt: chatSessions.createdAt,
        updatedAt: chatSessions.updatedAt,
        character: {
          id: characters.id,
          name: characters.name,
          slug: characters.slug,
        },
      })
      .from(chatSessions)
      .leftJoin(characters, eq(chatSessions.characterId, characters.id))
      .where(eq(chatSessions.userId, session.user.id))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(limit)
      .offset(offset);

    return new Response(
      JSON.stringify({ sessions }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch chat sessions" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
