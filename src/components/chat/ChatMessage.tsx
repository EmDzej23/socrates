type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-[var(--ink)] text-[var(--parchment)] px-6 py-4"
            : "bg-transparent"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 text-[var(--ink-light)]">
            <span className="text-lg">☉</span>
            <span className="text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-serif)' }}>
              Socrates
            </span>
          </div>
        )}
        <p 
          className={`text-lg leading-relaxed whitespace-pre-wrap ${
            isUser ? "" : "text-[var(--ink)] pl-6 border-l-2 border-[var(--ink-light)] border-opacity-30"
          }`}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {message.content}
        </p>
        {isUser && (
          <div className="mt-2 text-right text-xs text-[var(--parchment)] opacity-60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>
            You
          </div>
        )}
      </div>
    </div>
  );
}
