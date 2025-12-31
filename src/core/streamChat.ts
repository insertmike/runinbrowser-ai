import type {
  ChatCompletionContentPart,
  ChatCompletionRole,
} from "@mlc-ai/web-llm/lib/openai_api_protocols/index.js";
import type { Engine } from "./engine";
import { log } from "./logger";

export type StreamCallbacks = {
  onStart?: () => void;
  onDelta?: (delta: string, full: string) => void;
  onFinish?: (full: string, meta?: { stopReason?: string; usage?: unknown }) => void;
  onError?: (err: Error) => void;
  onStop?: () => void;
};

/**
 * Role set we support today, constrained from MLC/OpenAI roles.
 */
export type ChatRole = Extract<ChatCompletionRole, "system" | "user" | "assistant">;

/**
 * OpenAI-compatible message input type (subset) with required content for our flows.
 * Assistant content is required (string or null) because we do not expose tool_calls yet.
 */
export type InputMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string | ChatCompletionContentPart[] }
  | { role: "assistant"; content: string | null };

function normalizeInput<TMessage extends InputMessage>(
  input: TMessage[] | TMessage | string,
): TMessage[] {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    return [{ role: "user", content: input } as TMessage];
  }
  return [input];
}

export function streamChat<TMessage extends InputMessage>(
  engine: Engine<TMessage>,
  input: TMessage[] | TMessage | string,
  options: Record<string, unknown> & { temperature?: number | null } = {},
  callbacks: StreamCallbacks = {},
) {
  let full = "";
  let stopReason: string | undefined;
  let usage: unknown;

  const run = (async () => {
    try {
      callbacks.onStart?.();
      const normalized = normalizeInput(input);
      const stream = await engine.streamText(normalized, {
        stream: true,
        ...options,
      });

      for await (const chunk of stream) {
        const finish = chunk?.choices?.[0]?.finish_reason;
        if (finish) {
          stopReason = String(finish);
        }
        if (chunk?.usage) {
          usage = chunk.usage;
        }
        const delta = chunk?.choices?.[0]?.delta?.content ?? "";
        if (!delta) continue;
        full += delta;
        callbacks.onDelta?.(delta, full);
      }
      const meta: { stopReason?: string; usage?: unknown } = {};
      if (typeof stopReason !== "undefined") {
        meta.stopReason = stopReason;
      }
      if (typeof usage !== "undefined") {
        meta.usage = usage;
      }
      callbacks.onFinish?.(full, meta);
    } catch (e) {
      const msg = (e as Error)?.message?.toLowerCase?.() ?? "";
      if (msg.includes("abort") || msg.includes("aborted") || msg.includes("interrupt")) {
        callbacks.onStop?.();
      } else {
        callbacks.onError?.(e as Error);
      }
    }
  })();

  return {
    stop() {
      void engine.interruptGenerate().catch((e) => {
        log.error("Error interrupting generation:", e);
      });
      try {
        callbacks.onStop?.();
      } catch {
        // ensure stop never throws
      }
    },
    done: run,
  };
}
