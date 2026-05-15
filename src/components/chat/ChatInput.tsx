type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pose your question..."
        disabled={isLoading}
        className="flex-1 border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-5 py-4 text-lg text-[var(--ink)] placeholder-[var(--ink-light)] placeholder-opacity-50 focus:border-[var(--ink)] focus:outline-none disabled:opacity-50"
        style={{ fontFamily: 'var(--font-serif)' }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="bg-[var(--ink)] px-8 py-4 text-lg font-medium text-[var(--parchment)] hover:bg-[var(--ink-light)] focus:outline-none disabled:opacity-50 transition-colors"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {isLoading ? "..." : "Ask"}
      </button>
    </form>
  );
}
