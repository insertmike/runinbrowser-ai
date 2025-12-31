import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUserAgent } from "../../../shared/hooks/useUserAgent";
import { useIsInAppBrowser } from "../../../shared/hooks/useIsInAppBrowser";
import styles from "./WebGPUModal.module.css";

export interface WebGPUModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebGPUModal: React.FC<WebGPUModalProps> = ({ open, onOpenChange }) => {
  const { isIOS, isAndroid, isMac, isSafari, isFirefox, isWindows, isLinux } = useUserAgent();

  const isInApp = useIsInAppBrowser();

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render content based on priority
  const renderContent = () => {
    // Priority 1: In-App Browser
    if (isInApp) {
      return (
        <div className={styles.dialogSection}>
          <div className={styles.warningBox}>
            <strong>Open in Default Browser</strong>
          </div>
          <p>
            It seems you opened this link from an app link (e.g. Instagram, Messenger). To run AI,
            please tap the <strong>•••</strong> menu and select <strong>Open in Browser</strong>.
          </p>
          <button type="button" className={styles.copyButton} onClick={handleCopyLink}>
            {copied ? "Link Copied!" : "Copy Link"}
          </button>
        </div>
      );
    }

    // Priority 2: iOS
    if (isIOS) {
      return (
        <div className={styles.dialogSection}>
          <strong>Safari on iOS:</strong>
          <p className={styles.subText}>
            Settings → Safari → Advanced → Feature Flags → Enable "WebGPU"
          </p>
        </div>
      );
    }

    // Priority 3: Safari on Mac (Desktop)
    if (isMac && isSafari) {
      return (
        <div className={styles.dialogSection}>
          <strong>Safari on Mac:</strong>
          <ol className={styles.stepsList}>
            <li>Safari → Settings → Advanced → Check "Show features for web developers"</li>
            <li>Safari → Develop → Experimental Features → Check "WebGPU"</li>
            <li>Restart your browser</li>
          </ol>
        </div>
      );
    }

    // Priority 3: Android (Chrome)
    if (isAndroid) {
      return (
        <div className={styles.dialogSection}>
          <strong>Android (Chrome):</strong>
          <ol className={styles.stepsList}>
            <li>Update Chrome to the latest version</li>
            <li>
              In address bar, type: <code>chrome://flags</code>
            </li>
            <li>
              Search for & enable <strong>"Unsafe WebGPU"</strong>
            </li>
            <li>Relaunch Chrome</li>
          </ol>
        </div>
      );
    }

    // Priority 4: Firefox
    if (isFirefox) {
      if (isWindows) {
        return (
          <div className={styles.dialogSection}>
            <strong>Firefox on Windows:</strong>
            <p>
              Great news! Firefox 141+ supports WebGPU on Windows. Please ensure you are on the
              latest version.
            </p>
          </div>
        );
      }
      // Mac/Linux/Android Firefox
      return (
        <div className={styles.dialogSection}>
          <strong>Firefox (Experimental):</strong>
          <p>WebGPU support in Firefox on this platform is currently experimental.</p>
          <p>
            Please try using <strong>Chrome</strong>, <strong>Edge</strong>, or{" "}
            <strong>Safari</strong> (macOS) for the best experience.
          </p>
        </div>
      );
    }

    // Priority 5: Desktop (General/Other)
    return (
      <div className={styles.dialogSection}>
        <strong>Desktop:</strong>
        <p>
          Please use a modern browser like Chrome 113+, Edge 113+, or Safari 18+ with hardware
          acceleration enabled.
        </p>
        {isLinux && (
          <p className={styles.noteText}>
            Note for Linux: You may need to enable Vulkan drivers or specific browser flags.
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>Enable AI Engine</Dialog.Title>

          <Dialog.Description className={styles.dialogDescription}>
            Running AI locally is a new technology powered by WebGPU. Some browsers may require you
            to enable it manually.
          </Dialog.Description>

          {renderContent()}

          <div className={styles.dialogActions}>
            <Dialog.Close asChild>
              <button type="button" className={styles.buttonPrimary}>
                Got it
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close className={styles.dialogClose} aria-label="Close">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WebGPUModal;
