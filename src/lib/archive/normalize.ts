export function normalizeText(raw: string): string {
  let text = raw;

  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  text = text.replace(/\n{3,}/g, "\n\n");

  text = text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  text = text.trim();

  return text;
}
