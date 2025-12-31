import {
  prebuiltAppConfig,
  CreateMLCEngine,
  CreateWebWorkerMLCEngine,
  deleteModelAllInfoInCache,
  hasModelInCache,
} from "@mlc-ai/web-llm";

import type { InitProgressReport } from "@mlc-ai/web-llm/lib/types.js";
import type { ModelRecord } from "@mlc-ai/web-llm";
import type { MLCModelId } from "../../../config/models";
import type { AppConfig } from "@mlc-ai/web-llm/lib/config.js";
import { getMLCModel } from "../../../config/models";
import type { MLCEngine } from "@mlc-ai/web-llm/lib/engine.js";
import type { WebWorkerMLCEngine } from "@mlc-ai/web-llm/lib/web_worker.js";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionRequestBase,
} from "@mlc-ai/web-llm/lib/openai_api_protocols/index.js";
import type { Engine, LoadingProgress, BaseChatMessage, EngineStatus } from "../../engine";
import { EngineNotReadyError } from "../../engine";
import type { GenerationOptions } from "../../types";
import { log } from "../../logger";
import { createMLCWorker } from ".";

type MLCMessage = BaseChatMessage<"system" | "user" | "assistant">;

export interface MLCLoadModelOptions {
  useWorker?: boolean;
  onProgress?: (progress: LoadingProgress) => void;
}

/**
 * Options for generating text with MLC engine.
 * Extends GenerationOptions with MLC-specific options and requires stream: true.
 */
export interface MLCStreamTextOptions extends GenerationOptions {
  /** MLC-specific: JSON schema for structured output */
  json_schema?: string | Record<string, unknown>;
  /** MLC-specific: System prompt to prepend to messages */
  system_prompt?: string;
}

export class MLCEngineAdapter implements Engine<MLCMessage, MLCModelId> {
  private mlcEngine: MLCEngine | WebWorkerMLCEngine | null = null;
  private appConfig: AppConfig | null = prebuiltAppConfig;
  private worker: Worker | null = null;
  private statusState: EngineStatus = "idle";
  private currentModel: MLCModelId | null = null;
  private lastErrorState: Error | null = null;

  /**
   * Creates a new MLC engine adapter instance.
   */
  constructor() {}

  /**
   * Load a model for this engine (Engine interface implementation).
   * Returns the engine instance for method chaining.
   * @param modelId - Identifier for the model to load
   * @param options - Loading options including progress callback, worker settings, and quantization
   * @returns Promise resolving to this engine instance
   */
  async loadModel<M extends MLCModelId>(modelId: M, options?: MLCLoadModelOptions): Promise<this> {
    const modelRecord = getMLCModel(modelId);
    if (!modelRecord) {
      throw new Error(`Model ${modelId} not found in MLC-AI config`);
    }

    this.statusState = "loading";
    this.lastErrorState = null;
    this.currentModel = null;

    await this.loadModelInternal(modelRecord, options);
    this.statusState = "ready";
    this.currentModel = modelId;
    return this;
  }

  /**
   * Asynchronously cleans up the current worker, ensuring termination completes before proceeding.
   * Prevents race conditions when loadModel() is called multiple times rapidly.
   * @private
   */
  private cleanupWorker(): void {
    if (!this.worker) {
      return;
    }
    this.worker.terminate();
    this.worker = null;
  }

  /**
   * Loads an MLC model with optional worker support and progress tracking (internal implementation).
   * @param modelRecord - Model record from MLC-AI config
   * @param options - Additional loading options including worker settings and progress callback
   */
  private async loadModelInternal(modelRecord: ModelRecord, options: MLCLoadModelOptions = {}) {
    try {
      // Clean up any existing worker before creating a new one
      this.cleanupWorker();

      this.appConfig = prebuiltAppConfig;

      if (options.useWorker) {
        // Create worker from bundled code (no file path needed, works with any bundler)
        this.worker = createMLCWorker();

        this.worker.onerror = (error) => {
          log.error("[MLCEngine] Worker error:", error);
          // Don't throw here - let CreateWebWorkerMLCEngine handle initialization errors
        };

        this.worker.onmessageerror = (error) => {
          log.error("[MLCEngine] Worker message error:", error);
        };
      }

      log("[MLCEngine] Loading model:", modelRecord.model_id, "with worker:", !!this.worker);

      const engineConfig = {
        appConfig: this.appConfig,
        initProgressCallback: (progress: InitProgressReport) => {
          this.handleProgress(progress, options.onProgress);
        },
      };

      if (this.worker) {
        this.mlcEngine = await CreateWebWorkerMLCEngine(
          this.worker,
          modelRecord.model_id,
          engineConfig,
        );
      } else {
        this.mlcEngine = await CreateMLCEngine(modelRecord.model_id, engineConfig);
      }
    } catch (error) {
      this.cleanupWorker();
      const message = error instanceof Error ? error.message : String(error);
      this.statusState = "error";
      this.lastErrorState = error instanceof Error ? error : new Error(message);
      throw new Error(`Failed to load MLC model "${modelRecord.model_id}": ${message}`);
    }
  }

  /**
   * Handles progress reports from MLC engine initialization, converting them to standardized format.
   * @param report - Progress report from MLC engine
   * @param onProgress - Optional progress callback
   * @private
   */
  private handleProgress(
    report: InitProgressReport,
    onProgress?: (progress: LoadingProgress) => void,
  ): void {
    if (!onProgress) return;

    const text = report.text || "";

    // Handle cache loading with shard progress
    const cacheMatch = text.match(/Loading model from cache\[(\d+)\/(\d+)\]/);
    if (cacheMatch) {
      const currentShard = parseInt(cacheMatch[1] || "0", 10);
      const totalShards = parseInt(cacheMatch[2] || "0", 10);

      if (currentShard > 0 && totalShards > 0) {
        const progress = currentShard / totalShards;

        const MIN_SHARDS_FOR_ESTIMATION = 2;

        const estimatedTimeRemaining =
          // Only estimate after at least 2 shards to avoid early initialization overhead skewing results
          currentShard >= MIN_SHARDS_FOR_ESTIMATION
            ? (report.timeElapsed / currentShard) * (totalShards - currentShard)
            : null;

        onProgress({
          progress,
          text,
          timeElapsed: report.timeElapsed,
          estimatedTimeRemaining,
          isCacheLoading: true,
        });
      }
      return;
    }

    const p = report.progress;
    const estimatedTimeRemaining = p > 0 ? (report.timeElapsed / p) * (1 - p) : null;

    onProgress({
      progress: p,
      text,
      timeElapsed: report.timeElapsed,
      estimatedTimeRemaining,
      isCacheLoading: false,
    });
  }

  /**
   * Streams text using the loaded MLC model.
   * @param input - Array of chat messages to generate response for
   * @param options - Generation options including streaming configuration and model parameters
   * @returns Async iterable of chat completion chunks for streaming responses
   */
  async streamText(
    input: MLCMessage[] | MLCMessage | string,
    options: MLCStreamTextOptions = {},
  ): Promise<AsyncIterable<ChatCompletionChunk>> {
    if (!this.isReady || !this.mlcEngine) {
      throw new EngineNotReadyError();
    }

    const { json_schema, system_prompt, ...restOptions } = options;

    const normalizedInput: MLCMessage[] = Array.isArray(input)
      ? input
      : typeof input === "string"
        ? [{ role: "user", content: input } as MLCMessage]
        : [input];

    const processedMessages: ChatCompletionMessageParam[] = normalizedInput.map((m) => {
      if (m.role === "system") {
        return { role: "system", content: m.content };
      }
      if (m.role === "user") {
        return { role: "user", content: m.content };
      }
      // assistant branch (we do not support tool calls yet)
      return { role: "assistant", content: m.content };
    });

    if (system_prompt) {
      processedMessages.unshift({
        role: "system",
        content: system_prompt,
      });
    }

    const finalOptions: ChatCompletionRequestBase = {
      ...restOptions,
      stream: true,
      messages: processedMessages,
    };

    if (json_schema) {
      const schema = typeof json_schema === "string" ? json_schema : JSON.stringify(json_schema);
      finalOptions.response_format = {
        type: "json_object",
        schema,
      };
    }

    finalOptions.stream_options = { include_usage: true };
    return this.mlcEngine.chat.completions.create(finalOptions) as Promise<
      AsyncIterable<ChatCompletionChunk>
    >;
  }

  /**
   * Generates a buffered completion (non-streaming).
   * @param input - Array of chat messages to generate response for
   * @param options - Generation options including model parameters
   * @returns ChatCompletion result
   */
  async generateText(
    input: MLCMessage[] | MLCMessage | string,
    options: GenerationOptions = {},
  ): Promise<ChatCompletion> {
    if (!this.isReady || !this.mlcEngine) {
      throw new EngineNotReadyError();
    }

    const { json_schema, system_prompt, ...restOptions } = options as MLCStreamTextOptions;

    const normalizedInput: MLCMessage[] = Array.isArray(input)
      ? input
      : typeof input === "string"
        ? [{ role: "user", content: input } as MLCMessage]
        : [input];

    const processedMessages: ChatCompletionMessageParam[] = normalizedInput.map((m) => {
      if (m.role === "system") {
        return { role: "system", content: m.content };
      }
      if (m.role === "user") {
        return { role: "user", content: m.content };
      }
      return { role: "assistant", content: m.content };
    });

    if (system_prompt) {
      processedMessages.unshift({
        role: "system",
        content: system_prompt,
      });
    }

    const finalOptions: ChatCompletionRequestBase = {
      ...restOptions,
      stream: false,
      messages: processedMessages,
    };

    if (json_schema) {
      const schema = typeof json_schema === "string" ? json_schema : JSON.stringify(json_schema);
      finalOptions.response_format = {
        type: "json_object",
        schema,
      };
    }

    return this.mlcEngine.chat.completions.create(finalOptions) as Promise<ChatCompletion>;
  }

  /**
   * Check if the engine is currently loading a model.
   * @returns true if a load operation is in progress, false otherwise
   */
  get isLoading(): boolean {
    return this.statusState === "loading";
  }

  get isReady(): boolean {
    return this.statusState === "ready";
  }

  get status(): EngineStatus {
    return this.statusState;
  }

  get currentModelId(): MLCModelId | null {
    return this.currentModel;
  }

  get lastError(): Error | null {
    return this.lastErrorState;
  }

  /**
   * Cleans up resources including terminating any active worker and clearing the engine reference.
   */
  dispose() {
    if (this.mlcEngine) {
      // For non-worker engine, unload() is important to free GPU memory.
      // For worker engine, terminate() below is usually sufficient but calling unload() is safer.
      void this.mlcEngine.unload().catch((err) => {
        log.error("[MLCEngine] Unload failed during dispose:", err);
      });
    }
    this.cleanupWorker();
    this.mlcEngine = null;
    this.statusState = "idle";
    this.currentModel = null;
  }

  /**
   * Interrupts any currently running text generation operation.
   * Allows the UI to stop an in-flight generation request.
   */
  async interruptGenerate(): Promise<void> {
    try {
      await this.mlcEngine?.interruptGenerate?.();
    } catch (error) {
      log.error("[MLCEngine] interruptGenerate failed:", error);
    }
  }

  /**
   * Advanced: Underlying WebLLM engine instance (null until initialized).
   * Read-only reference; lifecycle managed by this adapter.
   */
  get engine(): MLCEngine | WebWorkerMLCEngine | null {
    return this.mlcEngine;
  }

  /**
   * Advanced: Current AppConfig tied to the loaded model (null if none).
   */
  get config(): AppConfig | null {
    return this.appConfig;
  }

  /**
   * Checks if a specific model is available in the cache.
   * @param modelId - The model identifier to check for in cache
   * @returns Promise resolving to true if the model is cached
   */
  async hasModelInCache(modelId: MLCModelId): Promise<boolean> {
    return hasModelInCache(modelId, this.appConfig || undefined);
  }

  /**
   * Gets a list of all models that are currently available in the cache.
   * Checks all models in the app configuration and returns those that are cached.
   * @returns Promise resolving to an array of cached model IDs
   */
  async getCachedModels(): Promise<MLCModelId[]> {
    if (!this.appConfig?.model_list) {
      console.log("No model list found");
      return [];
    }

    const cachedModels: MLCModelId[] = [];
    const modelIds = this.appConfig.model_list.map((m) => m.model_id) as MLCModelId[];

    // Check each model in parallel for better performance
    const cacheChecks = await Promise.all(
      modelIds.map(async (modelId) => {
        const isCached = await hasModelInCache(modelId, this.appConfig || undefined);
        return { modelId, isCached };
      }),
    );

    // Collect all cached model IDs
    for (const { modelId, isCached } of cacheChecks) {
      if (isCached) {
        cachedModels.push(modelId);
      }
    }

    return cachedModels;
  }

  /**
   * Clears all cached model artifacts from storage.
   * Removes cached data for all models in the current app configuration.
   */
  async clearModelCache(): Promise<void> {
    try {
      const models = this.appConfig?.model_list?.map((m) => m.model_id) || [];
      await Promise.all(
        models.map((id) => deleteModelAllInfoInCache(id, this.appConfig || undefined)),
      );
      log("Successfully cleared WebLLM caches");
    } catch (error) {
      log.error("Error clearing model cache:", error);
      throw error;
    }
  }
}
