import type { TextareaHTMLAttributes, ReactNode, KeyboardEvent, ChangeEvent } from "react";
import styles from "./Input.module.css";
import { StopIcon, SendIcon } from "~assets/icons";

export interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  onSend?: () => void;
  onStop?: () => Promise<void> | void;
  sendDisabled?: boolean;
  isStreaming?: boolean;
  additionalButtons?: ReactNode;
  leftActions?: ReactNode;
}

export function Input({
  label,
  error,
  className,
  onSend,
  onStop,
  sendDisabled,
  isStreaming,
  additionalButtons,
  leftActions,
  ...props
}: InputProps) {
  const inputClasses = [styles.input, error && styles.error, className].filter(Boolean).join(" ");

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isStreaming && onSend && !sendDisabled) {
      e.preventDefault();
      onSend();
    }
    if (props.onKeyPress) {
      props.onKeyPress(e);
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate sizing based on screen size so the input feels roomier on mobile
    const isMobile = window.innerWidth <= 768;
    const baseMinHeight = isMobile ? 104 : 96; // Match CSS min-height
    const lineHeight = isMobile ? 22 : 24;
    const maxLines = isMobile ? 9 : 8;
    const viewportCap = window.innerHeight * (isMobile ? 0.6 : 0.5); // never take more than ~half viewport
    const maxHeight = Math.min(baseMinHeight + lineHeight * (maxLines - 1), viewportCap);

    // Set height based on content, but cap at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${Math.max(newHeight, baseMinHeight)}px`;

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleStop = async () => {
    if (!onStop) return;
    try {
      await onStop();
    } catch (err) {
      console.error("Failed to stop generation", err);
    }
  };

  return (
    <div className={styles.inputContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        <textarea
          className={inputClasses}
          {...props}
          onKeyPress={handleKeyPress}
          onChange={handleInput}
          rows={1}
        />
        <div className={styles.actionToolbar}>
          <div className={styles.leftActions}>{leftActions}</div>
          <div className={styles.rightActions}>
            {additionalButtons}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className={styles.sendButton}
                aria-label="Stop generation"
                title="Stop"
              >
                <StopIcon />
              </button>
            ) : (
              onSend && (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={sendDisabled}
                  className={styles.sendButton}
                  aria-label="Send message"
                  title="Send"
                >
                  <SendIcon />
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

export default Input;
