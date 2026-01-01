import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { GitHubIcon, YouTubeIcon } from "~assets/icons";
import styles from "./SupportModal.module.css";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>Support Pocket Brain</Dialog.Title>
          <Dialog.Description className={styles.dialogDescription}>
            Pocket Brain is a free, open-source project built for a privacy-first web.
            <br />
            Support the creator by subscribing to his journey!
          </Dialog.Description>

          <div className={styles.actions}>
            <a
              href="https://www.youtube.com/@mihailyonchev?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionButton} ${styles.youtube}`}
            >
              <YouTubeIcon className={styles.icon} />
              <span>Subscribe to Mihail Yonchev</span>
            </a>

            <a
              href="https://github.com/insertmike/runinbrowser-ai"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionButton} ${styles.github}`}
            >
              <GitHubIcon className={styles.icon} />
              <span>Star the project on GitHub</span>
            </a>
          </div>

          <div className={styles.footer}>
            <button className={styles.dismissButton} onClick={() => onOpenChange(false)}>
              No thanks, I'm not supporting
            </button>
          </div>

          <Dialog.Close className={styles.dialogClose} aria-label="Close">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
