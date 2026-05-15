import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { socraticRules } from "@/lib/db/schema";
import { z } from "zod";

const createRuleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.number().default(100),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const rules = await db.select().from(socraticRules).orderBy(socraticRules.priority);
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Get rules error:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createRuleSchema.parse(body);

    const [rule] = await db
      .insert(socraticRules)
      .values({
        title: validated.title,
        content: validated.content,
        priority: validated.priority,
        active: validated.active,
      })
      .returning();

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Create rule error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
