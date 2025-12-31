import type {
  ChatCompletion,
  ChatCompletionChunk,
} from "@mlc-ai/web-llm/lib/openai_api_protocols/index.js";
import type { InitProgressReport } from "@mlc-ai/web-llm/lib/types.js";
import type { InputMessage } from "./streamChat";

export type EngineStatus = "idle" | "loading" | "ready" | "error";

export class EngineNotReadyError extends Error {
  code = "ENGINE_NOT_READY";
  constructor(message = "Engine not ready; call loadModel() first") {
    super(message);
    this.name = "EngineNotReadyError";
  }
}

/**
 * Loading progress information reported by engines during model initialization.
 * Extends mlc-ai's InitProgressReport with additional fields for enhanced progress tracking.
 */
export interface LoadingProgress extends InitProgressReport {
  /** Estimated time remaining in seconds, or null if unknown */
  estimatedTimeRemaining?: number | null;
  /** Whether the engine is currently loading from cache */
  isCacheLoading?: boolean;
}

/**
 * Base chat message format that all engines must support.
 * Engines can narrow the role union if they only support a subset.
 */
export type BaseChatMessage<TRole extends InputMessage["role"] = InputMessage["role"]> = Extract<
  InputMessage,
  { role: TRole }
>;

/**
 * Core interface that all LLM engines must implement.
 * Engines handle model loading, text generation, and resource cleanup.
 *
 * @template TMessage - The message type this engine accepts. Must extend BaseChatMessage.
 *                      Defaults to BaseChatMessage for simple engines.
 *                      Engines can specify custom role types or additional fields.
 *
 * @example
 * // Simple engine using default message type
 * const simpleEngine: Engine = {
 *   generateText: (messages) => ...
 * };
 *
 * @example
 * // Engine with extended message type (e.g., OpenAI supports name, function_call, etc.)
 * type OpenAIMessage = BaseChatMessage & {
 *   name?: string;
 *   function_call?: unknown;
 * };
 *
 * const openaiEngine: Engine<OpenAIMessage> = {
 *   generateText: (messages: OpenAIMessage[]) => ...
 * };
 *
 * @example
 * // Engine with custom roles (e.g., Gemini uses "model" instead of "assistant")
 * type GeminiRole = "user" | "model"; // Gemini doesn't use "system" or "assistant"
 * type GeminiMessage = BaseChatMessage<GeminiRole> & {
 *   parts?: Array<{ text: string }>;
 * };
 *
 * const geminiEngine: Engine<GeminiMessage> = {
 *   generateText: (messages: GeminiMessage[]) => {
 *     // Convert internally to Gemini format
 *   }
 * };
 */
export interface Engine<TMessage extends BaseChatMessage = BaseChatMessage, TModelId = string> {
  /** Current lifecycle status of the engine. */
  readonly status: EngineStatus;
  /** Convenience flag for ready status. */
  readonly isReady: boolean;
  /**
   * Stream text from a conversation history.
   *
   * @param input - Chat messages or a single string (string -> user message)
   * @param options - Generation options (temperature, max_tokens, etc.)
   * @returns Async iterable of ChatCompletionChunk objects
   */
  streamText(
    input: TMessage[] | TMessage | string,
    options?: Record<string, unknown>,
  ): Promise<AsyncIterable<ChatCompletionChunk>>;

  /**
   * Generate a full completion (non-streaming).
   *
   * @param input - Chat messages or a single string (string -> user message)
   * @param options - Generation options (temperature, max_tokens, etc.)
   * @returns Buffered ChatCompletion result
   */
  generateText(
    input: TMessage[] | TMessage | string,
    options?: Record<string, unknown> & { stream?: false },
  ): Promise<ChatCompletion>;

  /**
   * Interrupt an ongoing generation.
   * Should be safe to call even if no generation is in progress.
   */
  interruptGenerate(): Promise<void>;

  /**
   * Load a model for this engine.
   * Returns the engine instance for method chaining.
   *
   * @param modelId - Identifier for the model to load
   * @param options - Loading options including progress callback
   * @returns Promise resolving to the engine instance
   */
  loadModel(
    modelId: TModelId,
    options?: { onProgress?: (progress: LoadingProgress) => void },
  ): Promise<Engine<TMessage, TModelId>>;

  /**
   * Check if the engine is currently loading a model.
   */
  readonly isLoading: boolean;

  /** Last successfully loaded model ID, if any. */
  readonly currentModelId?: TModelId | null;

  /** Last error encountered during load or generation. */
  readonly lastError?: Error | null;

  /**
   * Dispose of engine resources (workers, memory, etc.).
   * Should be called when the engine is no longer needed.
   */
  dispose(): void;

  /**
   * Check if a specific model is cached locally.
   * Optional - engines that don't support caching can omit this.
   *
   * @param modelId - Model identifier to check
   * @returns Promise resolving to true if model is cached
   */
  hasModelInCache?(modelId: TModelId): Promise<boolean>;

  /**
   * Get a list of all models that are currently cached.
   * Optional - engines that don't support caching can omit this.
   *
   * @returns Promise resolving to an array of cached model IDs
   */
  getCachedModels?(): Promise<TModelId[]>;

  /**
   * Clear all cached models.
   * Optional - engines that don't support caching can omit this.
   */
  clearModelCache?(): Promise<void>;
}
