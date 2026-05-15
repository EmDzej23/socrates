import { NextRequest } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  chatSessions,
  chatMessages,
  socraticRules,
  retrievalLogs,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { retrieveRelevantChunks } from "@/lib/archive/retrieval";
import { buildSocraticSystemPrompt } from "@/lib/ai/prompts";

const chatRequestSchema = z.object({
  sessionId: z.string().uuid().nullish(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

const MAX_CHAT_HISTORY = parseInt(process.env.MAX_CHAT_HISTORY_MESSAGES || "6", 10);
const MAX_RETRIEVED_CHUNKS = parseInt(process.env.MAX_RETRIEVED_CHUNKS || "5", 10);
const MAX_RESPONSE_TOKENS = 1024;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = chatRequestSchema.parse(body);

    const latestUserMessage = validated.messages
      .filter((m) => m.role === "user")
      .pop();

    if (!latestUserMessage) {
      return new Response(
        JSON.stringify({ error: "No user message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let sessionId = validated.sessionId;

    if (!sessionId) {
      const [session] = await db
        .insert(chatSessions)
        .values({ title: latestUserMessage.content.slice(0, 100) })
        .returning();
      sessionId = session.id;
    }

    const rules = await db
      .select()
      .from(socraticRules)
      .where(eq(socraticRules.active, true))
      .orderBy(socraticRules.priority);

    const chunks = await retrieveRelevantChunks({
      query: latestUserMessage.content,
      limit: MAX_RETRIEVED_CHUNKS,
      minReliability: "low",
    });

    await db.insert(retrievalLogs).values({
      sessionId,
      userMessage: latestUserMessage.content,
      queryEmbeddingModel: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
      retrievedChunks: chunks.map((c) => ({
        id: c.id,
        title: c.title,
        author: c.author,
        similarity: c.similarity,
      })),
    });

    const systemPrompt = buildSocraticSystemPrompt({
      rules,
      chunks,
    });

    console.log(`System prompt length: ${systemPrompt.length} chars, ~${Math.ceil(systemPrompt.length / 4)} tokens`);
    console.log(`Retrieved ${chunks.length} chunks`);

    const recentMessages = validated.messages.slice(-MAX_CHAT_HISTORY);

    const model = anthropic(process.env.AI_CHAT_MODEL || "claude-sonnet-4-6");

    const result = streamText({
      model,
      system: systemPrompt,
      messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      maxTokens: MAX_RESPONSE_TOKENS,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ sessionId })}\n\n`)
        );

        const reader = result.textStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fullResponse += value;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: value })}\n\n`)
            );
          }

          await db.insert(chatMessages).values({
            sessionId,
            role: "user",
            content: latestUserMessage.content,
          });

          await db.insert(chatMessages).values({
            sessionId,
            role: "assistant",
            content: fullResponse,
            retrievedChunkIds: chunks.map((c) => c.id),
            model: process.env.AI_CHAT_MODEL || "claude-sonnet-4-6",
          });

          await db
            .update(chatSessions)
            .set({
              updatedAt: new Date(),
              messageCount: validated.messages.length + 1,
            })
            .where(eq(chatSessions.id, sessionId));

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && 'cause' in error ? String(error.cause) : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat", 
        message: errorMessage,
        details: errorDetails 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
