import type { MLCModelId } from "runinbrowser-ai";
import { Message } from "../Message";
import { ChatBox } from "../ChatBox/ChatBox";
import { Input } from "../Input/Input";
import { InputContainer } from "../InputContainer/InputContainer";
import { SuggestedActions } from "../SuggestedActions/SuggestedActions";
import { ModelSelect } from "../../../shared/components/ModelSelect";
import { LoadingState } from "../LoadingState";
import styles from "./ChatArea.module.css";

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  meta?: { stopReason?: string; usage?: unknown };
};

export interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => Promise<void>;
  onStop: () => void;
  selectedModel: MLCModelId;
  onModelChange: (model: MLCModelId) => void;
  hierarchicalGroups: ReturnType<
    typeof import("../../../../config/models").buildGroupedModelsFromMLC
  >["groups"];
  modelIdMap: ReturnType<
    typeof import("../../../../config/models").buildGroupedModelsFromMLC
  >["modelIdMap"];
  cachedModelIds: Set<string>;
  loadingCachedModels: boolean;
  getCachedModels: () => Promise<string[]>;
  isWebGPUSupported: boolean;
  onWebGPUModalOpen: () => void;
  loading: boolean;
  loadingProgress?: number | null | undefined;
  loadingText?: string | undefined;
  loadError?: Error | null | undefined;
  currentModelName?: string | undefined;
  onRetryLoad?: (() => void) | undefined;
  onSuggestedActionSelect?: ((text: string) => Promise<void>) | undefined;
}

export function ChatArea({
  messages,
  isStreaming,
  input,
  onInputChange,
  onSend,
  onStop,
  selectedModel,
  onModelChange,
  hierarchicalGroups,
  modelIdMap,
  cachedModelIds,
  loadingCachedModels,
  getCachedModels,
  isWebGPUSupported,
  onWebGPUModalOpen,
  loading,
  loadingProgress = null,
  loadingText = "",
  loadError,
  currentModelName = "",
  onRetryLoad,
  onSuggestedActionSelect,
}: ChatAreaProps) {
  const handleSuggestedActionSelect = async (text: string) => {
    if (!isWebGPUSupported) {
      onWebGPUModalOpen();
      return;
    }
    if (onSuggestedActionSelect) {
      await onSuggestedActionSelect(text);
    }
  };

  const isEmpty = messages.length === 0;
  const showLoadingState = loading || loadError;

  return (
    <>
      <ChatBox className={styles.chatBox} isEmpty={isEmpty && !showLoadingState}>
        {showLoadingState ? (
          <div className={styles.loadingStateContainer}>
            <LoadingState
              modelName={currentModelName}
              progress={loadingProgress}
              text={loadingText}
              error={loadError}
              onRetry={onRetryLoad}
            />
          </div>
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>💬</div>
            <h2 className={styles.emptyStateTitle}>Start a conversation</h2>
            <p className={styles.emptyStateSubtitle}>
              Ask me anything. I run entirely in your browser—no data leaves your device.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message key={message.id} text={message.content} isUser={message.role === "user"} />
            ))}
          </>
        )}
      </ChatBox>

      {/* Input area */}
      <div className={styles.inputArea}>
        {messages.length === 0 && !isStreaming && !showLoadingState && onSuggestedActionSelect && (
          <div className={styles.suggestedActionsWrapper}>
            <SuggestedActions
              onSelect={handleSuggestedActionSelect}
              disabled={loadingCachedModels}
            />
          </div>
        )}
        <div className={styles.inputWrapper}>
          <InputContainer>
            <Input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={
                loadingCachedModels
                  ? "Initializing..."
                  : loading
                    ? "Model is loading..."
                    : loadError
                      ? "Model failed to load"
                      : "Message Pocket Brain..."
              }
              disabled={loadingCachedModels || loading || !!loadError}
              onSend={onSend}
              sendDisabled={!input.trim() || loadingCachedModels || loading || !!loadError}
              isStreaming={isStreaming}
              onStop={onStop}
              leftActions={
                <ModelSelect
                  hierarchicalGroups={hierarchicalGroups}
                  modelIdMap={modelIdMap}
                  value={selectedModel}
                  onChange={(v) => onModelChange(v as MLCModelId)}
                  cachedModelIds={cachedModelIds}
                  loadingCachedModels={loadingCachedModels}
                  compact={true}
                  variant="ghost"
                  disabled={loadingCachedModels}
                  getCachedModels={getCachedModels}
                />
              }
            />
          </InputContainer>
        </div>
      </div>
    </>
  );
}

export default ChatArea;
