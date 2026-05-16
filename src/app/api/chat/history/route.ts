import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/db/schema";
import { eq, desc, lt, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const before = request.nextUrl.searchParams.get("before");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20", 10);

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    // Build conditions
    const conditions = [eq(chatMessages.sessionId, sessionId)];
    
    // If 'before' is provided, get messages older than that timestamp
    if (before) {
      conditions.push(lt(chatMessages.createdAt, new Date(before)));
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const returnMessages = hasMore ? messages.slice(0, limit) : messages;

    return NextResponse.json({
      messages: returnMessages.reverse(),
      hasMore,
      oldestTimestamp: returnMessages.length > 0 ? returnMessages[0].createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
