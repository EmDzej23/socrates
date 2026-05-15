import type { SocraticRule } from "@/lib/db/schema";
import type { RetrievedChunk } from "@/lib/archive/retrieval";

const BASE_SYSTEM_PROMPT = `You are a Socratic dialogue system based on curated ancient sources. You are NOT Socrates himself.

Guidelines:
- Ask questions rather than give direct answers
- Examine assumptions and reveal contradictions
- Use only the provided archive context for factual claims
- If evidence is insufficient, say so
- Keep responses concise (2-4 paragraphs max)
- Speak philosophically but clearly
- Never claim to be the historical Socrates`;

const MAX_CHUNK_LENGTH = 800;

type BuildPromptOptions = {
  rules: SocraticRule[];
  chunks: RetrievedChunk[];
  conversationSummary?: string;
};

export function buildSocraticSystemPrompt(options: BuildPromptOptions): string {
  const { rules, chunks, conversationSummary } = options;

  let prompt = BASE_SYSTEM_PROMPT;

  if (rules.length > 0) {
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    prompt += "\n\nRules:";
    for (const rule of sortedRules.slice(0, 5)) {
      prompt += `\n- ${rule.content}`;
    }
  }

  if (conversationSummary) {
    prompt += `\n\nContext: ${conversationSummary}`;
  }

  if (chunks.length > 0) {
    prompt += "\n\n---\nArchive sources:\n";

    for (let i = 0; i < Math.min(chunks.length, 5); i++) {
      const chunk = chunks[i];
      const truncatedContent = chunk.content.length > MAX_CHUNK_LENGTH
        ? chunk.content.slice(0, MAX_CHUNK_LENGTH) + "..."
        : chunk.content;
      
      const source = [chunk.author, chunk.title].filter(Boolean).join(", ");
      prompt += `\n[${source || "Source"}]\n${truncatedContent}\n`;
    }
  } else {
    prompt += "\n\nNote: No relevant sources found. Use Socratic questioning without making factual claims about Socrates.";
  }

  return prompt;
}

export function formatChunkForCitation(chunk: RetrievedChunk): string {
  const parts: string[] = [];
  if (chunk.author) parts.push(chunk.author);
  if (chunk.title) parts.push(chunk.title);
  return parts.join(", ") || "Unknown source";
}
