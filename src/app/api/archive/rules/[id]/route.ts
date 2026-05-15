import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socraticRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateRuleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  priority: z.number().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/archive/rules/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const validated = updateRuleSchema.parse(body);

    const [rule] = await db
      .update(socraticRules)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(socraticRules.id, id))
      .returning();

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Update rule error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/archive/rules/[id]">
) {
  try {
    const { id } = await ctx.params;

    const [deleted] = await db
      .delete(socraticRules)
      .where(eq(socraticRules.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete rule error:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
