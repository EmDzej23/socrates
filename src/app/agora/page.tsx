import { ChatWindow } from "@/components/chat/ChatWindow";

export const metadata = {
  title: "Agora — Socratic Dialogue",
  description: "Enter the agora for Socratic dialogue and examination.",
};

export default function AgoraPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ChatWindow />
    </main>
  );
}
