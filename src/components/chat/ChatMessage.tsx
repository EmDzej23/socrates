type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatMessageProps = {
  message: Message;
  characterName?: string;
};

export function ChatMessage({ message, characterName = "Philosopher" }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] ${
          isUser
            ? "bg-[var(--ink)] text-[var(--parchment)] px-4 py-3 sm:px-6 sm:py-4"
            : "bg-transparent"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 text-[var(--ink-light)]">
            <span className="text-base sm:text-lg">☉</span>
            <span className="text-xs sm:text-sm uppercase tracking-widest" style={{ fontFamily: 'var(--font-serif)' }}>
              {characterName}
            </span>
          </div>
        )}
        <p 
          className={`text-base sm:text-lg leading-relaxed whitespace-pre-wrap ${
            isUser ? "" : "text-[var(--ink)] pl-4 sm:pl-6 border-l-2 border-[var(--ink-light)] border-opacity-30"
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
