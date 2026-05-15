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
    <form onSubmit={onSubmit} className="flex gap-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
        disabled={isLoading}
        className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-900 placeholder-stone-500 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-500"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {isLoading ? "..." : "Ask"}
      </button>
    </form>
  );
}
