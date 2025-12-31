import styles from "./LoadingState.module.css";
import { ErrorIcon, RetryIcon } from "~assets/icons";

export interface LoadingStateProps {
  modelName: string;
  progress: number | null;
  text: string;
  error?: Error | null | undefined;
  onRetry?: (() => void) | undefined;
}

export function LoadingState({ modelName, progress, text, error, onRetry }: LoadingStateProps) {
  if (error) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.errorIcon}>
          <ErrorIcon />
        </div>
        <div className={styles.loadingText}>
          <div className={styles.errorTitle}>Failed to load {modelName}</div>
          <div className={styles.errorMessage}>
            {error.message || "An unexpected error occurred while loading the model."}
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={styles.retryButton}
              aria-label="Retry loading model"
            >
              <RetryIcon />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const isIndeterminate = progress === null;

  return (
    <div className={styles.loadingState}>
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>
        <div className={styles.loadingTitle}>Loading {modelName}...</div>
        <div className={styles.loadingSubtitle}>{text || "Preparing model"}</div>
        <div className={styles.loadingProgress}>
          <div className={styles.loadingProgressBar}>
            {isIndeterminate ? (
              <div className={styles.loadingProgressFillIndeterminate} />
            ) : (
              <div
                className={styles.loadingProgressFill}
                style={{ width: `${Math.max(4, (progress || 0) * 100)}%` }}
              />
            )}
          </div>
          {!isIndeterminate && (
            <span className={styles.loadingProgressText}>
              {`${((progress || 0) * 100).toFixed(0)}%`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
