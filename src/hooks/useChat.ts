import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { streamChat } from "../core/streamChat";
import type { InputMessage } from "../core/streamChat";
import type { Engine } from "../core/engine";
import type { GenerationOptions } from "../core/types";

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  meta?: { stopReason?: string; usage?: unknown };
};

export interface UseChatOptions {
  engine: Engine;
  systemPrompt?: string;
  /**
   * Arbitrary generation options to pass through to the engine via streamChat
   * (e.g., temperature, max_tokens, top_p, etc.).
   */
  generationOptions?: GenerationOptions;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  send: (providedText: string, options?: GenerationOptions) => Promise<void>;
  stop: () => void;
  regenerate: () => void;
  clear: () => void;
  engine: Engine | null;
}

export function useChat(options: UseChatOptions): UseChatReturn {
  const { engine, systemPrompt, generationOptions } = options;

  const controllerRef = useRef<{ stop: () => void; done: Promise<void> } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup on unmount - don't dispose provided engine
  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  const removeTrailingEmptyAssistant = useCallback((m: ChatMessage[]) => {
    if (m.length === 0) return m;
    const last = m[m.length - 1];
    if (!last) return m;
    const isEmptyAssistant =
      last.role === "assistant" && ((last.content as string | undefined) ?? "") === "";
    return isEmptyAssistant ? m.slice(0, -1) : m;
  }, []);

  const systemPayload = useMemo<InputMessage[]>(
    () => (systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    [systemPrompt],
  );

  const send = useCallback(
    async (providedText: string, options?: GenerationOptions) => {
      const text = (providedText ?? "").trim();
      if (!text || isStreaming) return;

      // Wait for loading to complete if still loading
      if (!engine?.isReady) {
        return; // Require engine ready before sending
      }

      // Do not preemptively abort here to avoid racing with a new generation

      const user: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const asst: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      // Use the current messages from ref for history before updating state
      const history: InputMessage[] = messagesRef.current.map(({ role, content }: ChatMessage) => ({
        role,
        content,
      }));

      setMessages((m: ChatMessage[]) => [...m, user, asst]);
      setIsStreaming(true);

      const input: InputMessage[] = [...systemPayload, ...history, { role: "user", content: text }];

      const finalOptions = {
        ...(generationOptions ?? {}),
        ...(options ?? {}),
      };

      const controller = streamChat(engine, input, finalOptions, {
        onDelta: (_delta, full) => {
          setMessages((m: ChatMessage[]) => {
            const copy = m.slice();
            const lastMsg = copy[copy.length - 1];
            if (lastMsg) {
              copy[copy.length - 1] = {
                ...lastMsg,
                content: full,
              };
            }
            return copy;
          });
        },
        onFinish: (_full, meta) => {
          setIsStreaming(false);
          controllerRef.current = null;
          // Attach finish metadata to the last assistant message
          setMessages((m: ChatMessage[]) => {
            if (m.length === 0) return m;
            const copy = m.slice();
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = {
                ...last,
                meta: { stopReason: meta?.stopReason, usage: meta?.usage },
              } as ChatMessage;
            }
            return copy;
          });
        },
        onError: () => {
          setIsStreaming(false);
          controllerRef.current = null;
          // Ensure we don't leave an empty assistant message on errors
          setMessages(removeTrailingEmptyAssistant);
        },
        onStop: () => {
          setIsStreaming(false);
          controllerRef.current = null;
        },
      });

      controllerRef.current = controller;
      return controller.done;
    },
    [isStreaming, systemPayload, engine, generationOptions, removeTrailingEmptyAssistant],
  );

  const stop = useCallback(() => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsStreaming(false);
    // Remove trailing empty assistant stub if present (interrupted stream)
    setMessages(removeTrailingEmptyAssistant);
  }, [removeTrailingEmptyAssistant]);

  const regenerate = useCallback(() => {
    if (isStreaming) return;

    const currentMessages = messagesRef.current;
    const lastUserIndex = [...currentMessages]
      .reverse()
      .findIndex((m: ChatMessage) => m.role === "user");

    if (lastUserIndex === -1) return;

    const actualIndex = currentMessages.length - 1 - lastUserIndex;
    const lastUser = currentMessages[actualIndex];

    if (!lastUser) return;

    // History is everything up to the last user message (exclusive)
    const history = currentMessages.slice(0, actualIndex);

    // Update both state AND ref immediately to avoid stale history in send()
    setMessages(history);
    messagesRef.current = history;

    // Now send the last user content again
    void send(lastUser.content);
  }, [isStreaming, send]);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    send,
    stop,
    regenerate,
    clear,
    engine,
  };
}
