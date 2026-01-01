// Core engines adapters
export { MLCEngineAdapter } from "./core/engines/index";

// Hooks
export { useChat, useMLCEngine, useWebGPUSupport } from "./hooks/index";

// Config
export { MLC_MODEL_IDS, type MLCModelId } from "./config/index";

// Types
export type {
  StreamCallbacks,
  Engine,
  LoadingProgress,
  BaseChatMessage,
  ChatRole,
  InputMessage,
  EngineStatus,
  GenerationOptions,
} from "./core/types";
export type {
  UseChatOptions,
  UseChatReturn,
  UseMLCEngineOptions,
  UseMLCEngineReturn,
} from "./hooks/index";

// Debug helper
/**
 * Enable debug logging for the runinbrowser-ai library.
 * This sets localStorage.debug = 'runinbrowser-ai' in browser environments.
 *
 * @example
 * ```typescript
 * import { enableDebug } from 'runinbrowser-ai';
 * enableDebug(); // Now all debug logs will be visible in the console
 * ```
 */
export function enableDebug(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.debug = "runinbrowser-ai";
  }
}

export * from "./config/models";
