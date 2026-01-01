import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { MLCModelId } from "runinbrowser-ai";
import { ModelSelect } from "../../../shared/components/ModelSelect";
import { ThemeSwitch } from "../../../shared/components/ThemeSwitch";
import styles from "./ChatSettingsModal.module.css";

export interface ChatSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: MLCModelId;
  onModelChange: (model: MLCModelId) => void;
  useWebWorker: boolean;
  onWebWorkerChange: (enabled: boolean) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  hierarchicalGroups: ReturnType<
    typeof import("../../../../config/models").buildGroupedModelsFromMLC
  >["groups"];
  modelIdMap: Record<string, string>;
  cachedModelIds: Set<string>;
  loadingCachedModels: boolean;
  getCachedModels: () => Promise<string[]>;
  onClearCache: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  clearingCache: boolean;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  open,
  onOpenChange,
  selectedModel,
  onModelChange,
  useWebWorker,
  onWebWorkerChange,
  temperature,
  onTemperatureChange,
  hierarchicalGroups,
  modelIdMap,
  cachedModelIds,
  loadingCachedModels,
  getCachedModels,
  onClearCache,
  onClearAllData,
  clearingCache,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>Settings</Dialog.Title>
          <Dialog.Description className={styles.dialogDescription}>
            Configure how Pocket Brain runs locally.
          </Dialog.Description>

          <div className={styles.settingsList}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Model</div>
                <div className={styles.settingsItemDesc}>Choose which model to use</div>
              </div>
              <ModelSelect
                hierarchicalGroups={hierarchicalGroups}
                modelIdMap={modelIdMap}
                value={selectedModel}
                onChange={(v) => onModelChange(v as MLCModelId)}
                cachedModelIds={cachedModelIds}
                loadingCachedModels={loadingCachedModels}
                getCachedModels={getCachedModels}
                disabled={loadingCachedModels}
              />
            </div>

            <div className={styles.settingsItem}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Appearance</div>
                <div className={styles.settingsItemDesc}>Toggle dark/light mode</div>
              </div>
              <ThemeSwitch variant="toggle" />
            </div>

            <div className={styles.settingsItem}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Temperature</div>
                <div className={styles.settingsItemDesc}>
                  Controls creativity vs. focus ({temperature.toFixed(1)})
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                className={styles.rangeInput}
              />
            </div>

            <div className={styles.settingsItem}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Web Worker</div>
                <div className={styles.settingsItemDesc}>Run generation in background thread</div>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={useWebWorker}
                  onChange={(e) => onWebWorkerChange(e.target.checked)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            <div className={styles.settingsItem}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Clear Model Cache</div>
                <div className={styles.settingsItemDesc}>
                  Remove downloaded models from this device
                </div>
              </div>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={onClearCache}
                disabled={clearingCache}
              >
                {clearingCache ? "Clearing..." : "Clear"}
              </button>
            </div>

            <div className={`${styles.settingsItem} ${styles.settingsItemDanger}`}>
              <div className={styles.settingsItemLabel}>
                <div className={styles.settingsItemTitle}>Reset All Data</div>
                <div className={styles.settingsItemDesc}>
                  Clear everything including chat history
                </div>
              </div>
              <button
                type="button"
                className={styles.buttonDanger}
                onClick={onClearAllData}
                disabled={clearingCache}
              >
                Reset
              </button>
            </div>
          </div>

          <div className={styles.dialogFooter}>
            Pocket Brain runs entirely in your browser. No data leaves your device.
          </div>
          <Dialog.Close className={styles.dialogClose} aria-label="Close">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ChatSettingsModal;
