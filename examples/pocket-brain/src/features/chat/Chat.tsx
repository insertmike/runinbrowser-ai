import { useCallback, useMemo, useState } from "react";
import { useChat, useMLCEngine, useWebGPUSupport } from "runinbrowser-ai";
import type { MLCModelId } from "runinbrowser-ai";
import { buildGroupedModelsFromMLC } from "../../config/models";
import { ChatHeader } from "./components/ChatHeader";
import { ChatArea } from "./components/ChatArea";
import { WebGPUModal } from "./modals/WebGPUModal";
import { ChatSettingsModal } from "./modals/ChatSettingsModal";
import { SupportModal } from "./modals/SupportModal";
import { FAQModal } from "./modals/FAQModal";
import styles from "./Chat.module.css";

export default function ChatInterface() {
  const [selectedModel, setSelectedModel] = useState<MLCModelId>("SmolLM2-135M-Instruct-q0f16-MLC");
  const [temperature, setTemperature] = useState(0.6);
  const [useWebWorker, setUseWebWorker] = useState(true);
  const isWebGPUSupported = useWebGPUSupport();
  const [showWebGPUModal, setShowWebGPUModal] = useState(false);

  const [clearingCache, setClearingCache] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [loadingText, setLoadingText] = useState<string>("");

  // Use the new useMLCEngine hook for cleaner engine management
  const { engine, isLoading, isReady, progress, error, loadModel, clearCache, cachedModels } =
    useMLCEngine({
      // No modelId - lazy load on first message
      useWorker: useWebWorker,
      onProgress: (progressInfo) => {
        if (typeof progressInfo.text === "string") {
          setLoadingText(progressInfo.text);
        }
      },
      onError: (error) => {
        // Automatically show WebGPU modal if error is WebGPU-related
        if (isWebGPUError(error)) {
          setShowWebGPUModal(true);
        }
      },
    });

  const isWebGPUError = useCallback((error: Error): boolean => {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes("webgpu") ||
      errorMessage.includes("webgpunotavailable") ||
      error.name === "WebGPUNotAvailableError"
    );
  }, []);

  // Load model manually (lazy loading pattern)
  const handleLoadModel = useCallback(async (): Promise<boolean> => {
    if (isReady) return true;
    if (isLoading) return false;

    try {
      setLoadingText("Starting model load…");
      await loadModel(selectedModel, { useWorker: useWebWorker });
      return true;
    } catch (error) {
      console.error("Failed to load model:", error);
      return false;
    }
  }, [isReady, isLoading, loadModel, selectedModel, useWebWorker]);

  const { messages, isStreaming, send, stop, clear } = useChat({
    engine,
    systemPrompt: "You are a helpful assistant.",
    generationOptions: {
      temperature,
    },
  });

  const { groups: hierarchicalGroups, modelIdMap } = useMemo(() => buildGroupedModelsFromMLC(), []);

  // Cached models come directly from useMLCEngine
  const cachedModelIds = useMemo(() => new Set(cachedModels), [cachedModels]);

  const handleClearCache = async () => {
    if (clearingCache) return;
    setClearingCache(true);
    try {
      await clearCache();
    } finally {
      setClearingCache(false);
    }
  };

  const handleClearAllData = async () => {
    try {
      setClearingCache(true);
      if (caches?.keys) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.clear();
      sessionStorage.clear();
      clear();
    } catch (e) {
      console.error("Error clearing all data:", e);
    } finally {
      setClearingCache(false);
    }
  };

  const [input, setInput] = useState("");

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!isWebGPUSupported) {
      setShowWebGPUModal(true);
      return;
    }

    // Load model if not already loaded
    if (!isReady && !isLoading) {
      const success = await handleLoadModel();
      if (!success) {
        return;
      }
    }

    // Wait for model to finish loading if it's currently loading
    if (isLoading) {
      return;
    }

    setInput("");
    await send(text);
  };

  const handleSuggestedActionSelect = async (text: string) => {
    if (!isWebGPUSupported) {
      setShowWebGPUModal(true);
      return;
    }

    // Load model if not already loaded
    if (!isReady && !isLoading) {
      const success = await handleLoadModel();
      if (!success) {
        return;
      }
    }

    // Wait for model to finish loading if it's currently loading
    if (isLoading) {
      return;
    }

    await send(text);
  };

  const getCachedModels = async () => {
    return cachedModels;
  };

  const currentModelName = modelIdMap[selectedModel] || selectedModel;

  return (
    <div className={styles.chatRoot}>
      <ChatHeader
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSupportClick={() => setIsSupportOpen(true)}
        onFAQClick={() => setIsFAQOpen(true)}
      />

      <main className={styles.main}>
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onStop={stop}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          hierarchicalGroups={hierarchicalGroups}
          modelIdMap={modelIdMap}
          cachedModelIds={cachedModelIds}
          loadingCachedModels={false}
          getCachedModels={getCachedModels}
          isWebGPUSupported={isWebGPUSupported}
          onWebGPUModalOpen={() => setShowWebGPUModal(true)}
          loading={isLoading}
          loadingProgress={progress}
          loadingText={loadingText}
          loadError={error}
          currentModelName={currentModelName}
          onRetryLoad={error ? handleLoadModel : undefined}
          onSuggestedActionSelect={handleSuggestedActionSelect}
        />
      </main>

      <WebGPUModal open={showWebGPUModal} onOpenChange={setShowWebGPUModal} />

      <ChatSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        useWebWorker={useWebWorker}
        onWebWorkerChange={setUseWebWorker}
        hierarchicalGroups={hierarchicalGroups}
        modelIdMap={modelIdMap}
        cachedModelIds={cachedModelIds}
        loadingCachedModels={false}
        getCachedModels={getCachedModels}
        onClearCache={handleClearCache}
        onClearAllData={handleClearAllData}
        clearingCache={clearingCache}
      />

      <SupportModal open={isSupportOpen} onOpenChange={setIsSupportOpen} />
      <FAQModal open={isFAQOpen} onOpenChange={setIsFAQOpen} />
    </div>
  );
}
