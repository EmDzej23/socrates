"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AuthModal } from "@/components/auth/AuthModal";
import { useSession, signOut } from "@/lib/auth-client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Character = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  greetingMessage: string | null;
};

const SESSION_KEY = "chat_session_id";
const CHARACTER_KEY = "chat_character_id";

export function ChatWindow() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const handleUserScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom > threshold) {
      shouldAutoScrollRef.current = false;
    }
  }, []);

  const getWelcomeMessage = (character: Character): Message => ({
    id: "welcome",
    role: "assistant",
    content: character.greetingMessage || `Let us begin with care, friend. I am ${character.name}. What question weighs upon your mind?`,
  });

  const scrollToBottom = useCallback((force = false) => {
    if (force || shouldAutoScrollRef.current) {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  const loadCharacters = useCallback(async () => {
    try {
      const response = await fetch("/api/characters");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
        
        const storedCharacterId = localStorage.getItem(CHARACTER_KEY);
        if (storedCharacterId) {
          const found = data.find((c: Character) => c.id === storedCharacterId);
          if (found) {
            setSelectedCharacter(found);
          } else if (data.length > 0) {
            setSelectedCharacter(data[0]);
            localStorage.setItem(CHARACTER_KEY, data[0].id);
          }
        } else if (data.length > 0) {
          setSelectedCharacter(data[0]);
          localStorage.setItem(CHARACTER_KEY, data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load characters:", error);
    } finally {
      setIsLoadingCharacters(false);
    }
  }, []);

  const loadHistory = useCallback(async (sid: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sid}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })));
          setHasMore(data.hasMore);
        } else if (selectedCharacter) {
          setMessages([getWelcomeMessage(selectedCharacter)]);
        }
      } else if (selectedCharacter) {
        setMessages([getWelcomeMessage(selectedCharacter)]);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      if (selectedCharacter) {
        setMessages([getWelcomeMessage(selectedCharacter)]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [selectedCharacter]);

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem(SESSION_KEY);
    setChatSessionId(null);
    if (selectedCharacter) {
      setMessages([getWelcomeMessage(selectedCharacter)]);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  useEffect(() => {
    if (!selectedCharacter || isSessionLoading) return;
    
    // If not logged in, show auth modal and welcome message
    if (!session?.user) {
      setMessages([getWelcomeMessage(selectedCharacter)]);
      setIsLoadingHistory(false);
      return;
    }
    
    // User is logged in - try to restore last session
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    if (storedSessionId) {
      setChatSessionId(storedSessionId);
      loadHistory(storedSessionId);
    } else {
      setMessages([getWelcomeMessage(selectedCharacter)]);
      setIsLoadingHistory(false);
    }
  }, [selectedCharacter, loadHistory, session?.user, isSessionLoading]);

  useEffect(() => {
    if (!isLoadingHistory) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, isLoadingHistory, scrollToBottom]);

  const handleCharacterChange = (character: Character) => {
    setSelectedCharacter(character);
    localStorage.setItem(CHARACTER_KEY, character.id);
    localStorage.removeItem(SESSION_KEY);
    setChatSessionId(null);
    setMessages([getWelcomeMessage(character)]);
    setHasMore(false);
    shouldAutoScrollRef.current = true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCharacter) return;

    // Require authentication to chat
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    shouldAutoScrollRef.current = true;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: chatSessionId,
          characterId: selectedCharacter.id,
          messages: [...messages.filter((m) => m.id !== "welcome" && m.content.trim()), userMessage]
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.sessionId && !chatSessionId) {
                setChatSessionId(parsed.sessionId);
                localStorage.setItem(SESSION_KEY, parsed.sessionId);
              }
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: m.content + parsed.content }
                      : m
                  )
                );
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Forgive me, I am unable to respond at this moment. Let us try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    localStorage.removeItem(SESSION_KEY);
    setChatSessionId(null);
    if (selectedCharacter) {
      setMessages([getWelcomeMessage(selectedCharacter)]);
    }
    setHasMore(false);
  };

  if (isLoadingCharacters || isSessionLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-[calc(100vh-2rem)] papyrus-texture">
        <span className="text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Summoning the philosophers...
        </span>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-[calc(100vh-2rem)] papyrus-texture">
        <div className="text-center">
          <span className="text-4xl block mb-4">🏛</span>
          <p className="text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
            No philosophers are currently available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-2rem)] papyrus-texture overflow-hidden">
      <header className="border-b-2 border-[var(--ink-light)] border-opacity-20 px-4 py-3 sm:px-6 sm:py-5">
        <div className="max-w-2xl mx-auto">
          {/* Top row: Logo and auth */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <span className="text-xl sm:text-2xl text-[var(--ink-light)] shrink-0">⏣</span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-semibold text-[var(--ink)] tracking-wide truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                  Tarkos Agora
                </h1>
                <p className="hidden sm:block text-sm text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                  a place of assembly and discourse
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {session?.user ? (
                <>
                  <span className="hidden sm:inline text-sm text-[var(--ink-light)] max-w-[120px] truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                    {session.user.name || session.user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-[var(--terracotta)] hover:text-[var(--terracotta)]/80 transition-colors whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm text-[var(--olive)] hover:text-[var(--olive)]/80 transition-colors whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
          {/* Bottom row: Character select and new chat */}
          {(characters.length > 1 || chatSessionId) && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[var(--ink-light)]/10">
              {characters.length > 1 && (
                <select
                  value={selectedCharacter?.id || ""}
                  onChange={(e) => {
                    const char = characters.find(c => c.id === e.target.value);
                    if (char) handleCharacterChange(char);
                  }}
                  className="flex-1 sm:flex-none border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-2 sm:px-3 py-1 text-[var(--ink)] text-sm focus:border-[var(--ink)] focus:outline-none"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              )}
              {chatSessionId && (
                <button
                  onClick={handleNewChat}
                  className="text-sm text-[var(--ink-light)] hover:text-[var(--ink)] transition-colors whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  New dialogue
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div 
        ref={messagesContainerRef}
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                Recalling our discourse...
              </span>
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="text-center text-sm text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                  Earlier messages exist...
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  characterName={selectedCharacter?.name}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-3 text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                  <span className="text-lg">⋯</span>
                  <span className="text-base">contemplating...</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t-2 border-[var(--ink-light)] border-opacity-20 px-4 py-3 sm:px-6 sm:py-5">
        <div className="mx-auto max-w-2xl">
          {!session?.user && (
            <p className="text-center text-sm text-[var(--ink-light)] mb-3 italic" style={{ fontFamily: 'var(--font-serif)' }}>
              Sign in to begin your philosophical dialogue
            </p>
          )}
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading || isLoadingHistory}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}
