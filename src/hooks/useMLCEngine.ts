import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MLCEngineAdapter } from "../core/engines/index";
import type { MLCModelId } from "../config/index";
import type { LoadingProgress, EngineStatus } from "../core/types";
import { MLCLoadModelOptions } from "../core/engines/mlc/mlc-engine-adapter";

export interface UseMLCEngineOptions {
  /**
   * Model ID to automatically load on mount. If not provided, call loadModel() manually.
   */
  modelId?: MLCModelId;
  /**
   * Whether to use a Web Worker for model inference (recommended).
   * @default true
   */
  useWorker?: boolean;
  /**
   * Callback for model loading progress updates.
   */
  onProgress?: (progress: LoadingProgress) => void;
  /**
   * Callback for error handling.
   */
  onError?: (error: Error) => void;
}

export interface UseMLCEngineReturn {
  /** The MLC engine adapter instance */
  engine: MLCEngineAdapter;
  /** Current lifecycle status of the engine */
  status: EngineStatus;
  /** Whether the engine is ready to generate text */
  isReady: boolean;
  /** Whether the engine is currently loading a model */
  isLoading: boolean;
  /** Loading progress (0-1) */
  progress: number;
  /** Last error that occurred during loading or generation */
  error: Error | null;
  /** Currently loaded model ID */
  currentModelId: MLCModelId | null;

  /** Load a model into the engine */
  loadModel: (
    modelId: MLCModelId,
    options?: { useWorker?: boolean; onProgress?: (progress: LoadingProgress) => void },
  ) => Promise<void>;
  /** Unload the current model and reset state */
  unload: () => Promise<void>;

  /** List of models currently cached locally */
  cachedModels: MLCModelId[];
  /** Check if a specific model is cached */
  hasModelInCache: (modelId: MLCModelId) => Promise<boolean>;
  /** Clear all cached models */
  clearCache: () => Promise<void>;
}

/**
 * React hook for managing an MLC engine instance.
 *
 * This is the recommended way to use runinbrowser with React.
 * It handles engine lifecycle, model loading, progress tracking, and cache management.
 *
 * @example
 * ```tsx
 * function ChatApp() {
 *   const mlc = useMLCEngine({
 *     modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
 *     useWorker: true,
 *   });
 *
 *   const chat = useChat({ engine: mlc.engine });
 *
 *   if (mlc.isLoading) {
 *     return <LoadingIndicator progress={mlc.progress} />;
 *   }
 *
 *   return <ChatUI messages={chat.messages} onSend={chat.send} />;
 * }
 * ```
 */
export function useMLCEngine(options: UseMLCEngineOptions = {}): UseMLCEngineReturn {
  const { modelId, useWorker = true, onProgress, onError } = options;

  // Create engine instance once and reuse across re-renders
  const engine = useMemo(() => new MLCEngineAdapter(), []);

  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [cachedModels, setCachedModels] = useState<MLCModelId[]>([]);

  // Track if we've already auto-loaded to prevent double-loading
  const hasAutoLoaded = useRef(false);

  useEffect(() => {
    const loadCachedModels = async () => {
      if (engine.getCachedModels) {
        try {
          const models = await engine.getCachedModels();
          setCachedModels(models);
        } catch {
          // Ignore cache loading errors
        }
      }
    };
    void loadCachedModels();
  }, [engine]);

  const loadModel = useCallback(
    async (targetModelId: MLCModelId, loadOptions?: MLCLoadModelOptions) => {
      setError(null);
      setProgress(0);

      return engine
        .loadModel(targetModelId, {
          useWorker: loadOptions?.useWorker ?? useWorker,
          onProgress: (p) => {
            setProgress(p.progress);
            loadOptions?.onProgress?.(p);
            onProgress?.(p);
          },
        })
        .then(() => {
          // Refresh cached models list in background (non-blocking)
          if (engine.getCachedModels) {
            void engine
              .getCachedModels()
              .then(setCachedModels)
              .catch(() => {
                // Ignore cache list refresh errors
              });
          }
        })
        .catch((err) => {
          const errorObj = err as Error;
          setError(errorObj);
          onError?.(errorObj);
          throw errorObj;
        });
    },
    [engine, useWorker, onProgress, onError],
  );

  useEffect(() => {
    if (modelId && !hasAutoLoaded.current) {
      hasAutoLoaded.current = true;
      void loadModel(modelId);
    }
  }, [modelId, loadModel]);

  const unload = useCallback(async () => {
    await engine.interruptGenerate();
    engine.dispose();
    setProgress(0);
    setError(null);
  }, [engine]);

  const hasModelInCache = useCallback(
    async (targetModelId: MLCModelId) => {
      if (engine.hasModelInCache) {
        return await engine.hasModelInCache(targetModelId);
      }
      return false;
    },
    [engine],
  );

  const clearCache = useCallback(async () => {
    if (engine.clearModelCache) {
      await engine.clearModelCache();
      setCachedModels([]);
    }
  }, [engine]);

  useEffect(() => {
    return () => {
      engine.dispose();
    };
  }, [engine]);

  return {
    engine,
    status: engine.status,
    isReady: engine.isReady,
    isLoading: engine.isLoading,
    progress,
    error,
    currentModelId: engine.currentModelId ?? null,

    loadModel,
    unload,

    // Cache management
    cachedModels,
    hasModelInCache,
    clearCache,
  };
}
