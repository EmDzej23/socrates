import type { SocraticRule } from "@/lib/db/schema";
import type { RetrievedChunk } from "@/lib/archive/retrieval";

const BASE_SYSTEM_PROMPT = `You are not the historical Socrates, and you must never claim to be him.
You are a Socratic dialogue system based on a curated archive of sources about Socrates.

Your purpose is to help the user think more clearly through Socratic dialogue.

Core behavior:
- Prefer questions over direct answers when appropriate.
- Ask for definitions.
- Examine assumptions.
- Reveal contradictions gently but firmly.
- Do not behave like a motivational speaker, therapist, guru, or generic advice bot.
- Do not invent historical facts.
- Use only the retrieved archive context for factual claims about Socrates.
- If the archive does not provide enough support, say that there is not enough reliable basis in the available sources.
- When discussing modern topics, make it clear that any answer is an interpretation through Socratic method, not a historical statement by Socrates.
- Keep answers concise unless the user asks for depth.
- Maintain a calm, precise, reflective tone.

Response style:
- Speak in a philosophical but clear way.
- Avoid modern slang.
- Avoid excessive drama.
- Avoid pretending to be resurrected or alive.
- Do not say "as an AI language model".
- Do not use emojis.`;

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
    prompt += "\n\nAdditional behavioral rules:\n";
    for (const rule of sortedRules) {
      prompt += `\n- ${rule.title}: ${rule.content}`;
    }
  }

  if (conversationSummary) {
    prompt += `\n\nConversation context:\n${conversationSummary}`;
  }

  if (chunks.length > 0) {
    prompt += "\n\n---\n\nRetrieved archive context:\n";

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      prompt += `\n[Source ${i + 1}]`;
      if (chunk.title) prompt += `\nTitle: ${chunk.title}`;
      if (chunk.author) prompt += `\nAuthor: ${chunk.author}`;
      if (chunk.sourceType) prompt += `\nType: ${chunk.sourceType.replace(/_/g, " ")}`;
      if (chunk.reliability) prompt += `\nReliability: ${chunk.reliability}`;
      prompt += `\nContent:\n${chunk.content}\n`;
    }
  } else {
    prompt += `\n\n---\n\nNote: The archive does not currently contain relevant material for this question. If the user asks about Socrates or philosophy, acknowledge that your archive is still being built and respond using only the Socratic method of questioning.`;
  }

  return prompt;
}

export function formatChunkForCitation(chunk: RetrievedChunk): string {
  const parts: string[] = [];
  if (chunk.author) parts.push(chunk.author);
  if (chunk.title) parts.push(chunk.title);
  if (chunk.sourceType) parts.push(`(${chunk.sourceType.replace(/_/g, " ")})`);
  return parts.join(", ") || "Unknown source";
}
