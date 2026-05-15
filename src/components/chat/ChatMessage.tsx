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
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "bg-stone-100 text-stone-900 dark:bg-stone-900 dark:text-stone-100"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
