const TARGET_CHUNK_SIZE = 800;
const OVERLAP_SIZE = 100;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export type TextChunk = {
  content: string;
  index: number;
  tokenEstimate: number;
};

export function chunkText(text: string): TextChunk[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: TextChunk[] = [];

  let currentChunk = "";
  let overlapBuffer = "";

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    const currentTokens = estimateTokens(currentChunk);

    if (paragraphTokens > TARGET_CHUNK_SIZE) {
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunks.length,
          tokenEstimate: estimateTokens(currentChunk.trim()),
        });
        overlapBuffer = getOverlapText(currentChunk, OVERLAP_SIZE);
        currentChunk = overlapBuffer;
      }

      const sentences = splitIntoSentences(paragraph);
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);
        const currentTokensNow = estimateTokens(currentChunk);

        if (currentTokensNow + sentenceTokens > TARGET_CHUNK_SIZE && currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            index: chunks.length,
            tokenEstimate: estimateTokens(currentChunk.trim()),
          });
          overlapBuffer = getOverlapText(currentChunk, OVERLAP_SIZE);
          currentChunk = overlapBuffer + " " + sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
    } else if (currentTokens + paragraphTokens > TARGET_CHUNK_SIZE) {
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunks.length,
          tokenEstimate: estimateTokens(currentChunk.trim()),
        });
        overlapBuffer = getOverlapText(currentChunk, OVERLAP_SIZE);
        currentChunk = overlapBuffer + "\n\n" + paragraph;
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
      tokenEstimate: estimateTokens(currentChunk.trim()),
    });
  }

  return chunks;
}

function splitIntoSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map((s) => s.trim()).filter(Boolean);
}

function getOverlapText(text: string, targetTokens: number): string {
  const words = text.split(/\s+/);
  const targetWords = Math.ceil(targetTokens * 4 / 5);

  if (words.length <= targetWords) {
    return text;
  }

  return words.slice(-targetWords).join(" ");
}
