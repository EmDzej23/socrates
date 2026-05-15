import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema";
import { eq, desc, lt } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const before = request.nextUrl.searchParams.get("before");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20", 10);

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    let query = db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit + 1);

    const messages = await query;

    const hasMore = messages.length > limit;
    const returnMessages = hasMore ? messages.slice(0, limit) : messages;

    return NextResponse.json({
      messages: returnMessages.reverse(),
      hasMore,
      oldestId: returnMessages.length > 0 ? returnMessages[0].id : null,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
