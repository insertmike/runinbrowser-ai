// Core types that may be shared across modules
export type { StreamCallbacks, ChatRole, InputMessage } from "./streamChat";
export type { Engine, LoadingProgress, BaseChatMessage, EngineStatus } from "./engine";
import type { ChatCompletionRequestBase } from "@mlc-ai/web-llm/lib/openai_api_protocols/index.js";

/**
 * Common generation options passed to engines via streamChat/generateText.
 * Based on WebLLM's OpenAI-compatible request, excluding the messages payload.
 */
export type GenerationOptions = Omit<ChatCompletionRequestBase, "messages">;
