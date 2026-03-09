import { useState, useCallback, useRef, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const DAILY_LIMIT = 100;
const USAGE_KEY = "chat-usage";
const HISTORY_KEY = "chat-history";
const MAX_CONTEXT_MESSAGES = 10; // last N messages sent to AI

function getUsageToday(): number {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    if (date !== new Date().toISOString().slice(0, 10)) return 0;
    return count;
  } catch { return 0; }
}

function incrementUsage(): void {
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageToday();
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: current + 1 }));
}

export function getRemainingChats(): number {
  return Math.max(0, DAILY_LIMIT - getUsageToday());
}

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs));
  } catch { /* quota exceeded – ignore */ }
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist messages whenever they change (skip empty streaming placeholders)
  useEffect(() => {
    const toSave = messages.filter((m) => m.content.length > 0);
    if (toSave.length > 0 || messages.length === 0) {
      saveHistory(toSave);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (input: string, userContext: Record<string, unknown>) => {
      setError(null);
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      // Send only last N messages for context to avoid token overflow
      const contextMessages = [
        ...messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: input },
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      if (getUsageToday() >= DAILY_LIMIT) {
        setError("Daily chat limit reached (100/day). Come back tomorrow! 🌅");
        setIsStreaming(false);
        return;
      }

      try {
        incrementUsage();
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: contextMessages, userContext }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${resp.status}`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantSoFar = "";
        const assistantId = crypto.randomUUID();
        let streamDone = false;

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
        ]);

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantSoFar += content;
                const captured = assistantSoFar;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: captured } : m))
                );
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantSoFar += content;
                const captured = assistantSoFar;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: captured } : m))
                );
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    saveHistory([]);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearChat, stopStreaming };
}
