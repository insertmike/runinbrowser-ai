import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./DebugModal.module.css";
import type { ConsoleLogEntry } from "../../../shared/hooks/useConsoleCapture";

export interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ConsoleLogEntry[];
  clearLogs: () => void;
}

type LogLevel = "log" | "info" | "warn" | "error";

export const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose, logs, clearLogs }) => {
  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(
    new Set(["log", "info", "warn", "error"]),
  );
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = async () => {
    try {
      const text = logs
        .map(
          (log) => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`,
        )
        .join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy logs:", err);
    }
  };

  if (!isOpen) return null;

  const toggleFilter = (level: LogLevel) => {
    setActiveFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(level)) {
        newFilters.delete(level);
      } else {
        newFilters.add(level);
      }
      return newFilters;
    });
  };

  const filteredLogs = logs.filter((log) => activeFilters.has(log.level));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const getLogCounts = () => {
    const counts = { log: 0, info: 0, warn: 0, error: 0 };
    logs.forEach((log) => counts[log.level]++);
    return counts;
  };

  const logCounts = getLogCounts();

  return ReactDOM.createPortal(
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.debugIcon}>🐛</span>
            Browser Console
          </div>

          <div className={styles.headerActions}>
            <div className={styles.filterButtons}>
              {(["log", "info", "warn", "error"] as LogLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.filterButton} ${styles[level]} ${
                    activeFilters.has(level) ? styles.active : ""
                  }`}
                  onClick={() => toggleFilter(level)}
                  title={`${level.toUpperCase()} (${logCounts[level]})`}
                >
                  {level} ({logCounts[level]})
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.clearButton}
              onClick={handleCopy}
              title="Copy logs to clipboard"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearLogs}
              title="Clear all logs"
            >
              Clear
            </button>
          </div>

          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Close debug console"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.logsContainer} ref={logsContainerRef}>
            {filteredLogs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📋</div>
                <div className={styles.emptyStateTitle}>
                  {logs.length === 0 ? "No console output yet" : "No logs match current filters"}
                </div>
                <div className={styles.emptyStateSubtitle}>
                  {logs.length === 0
                    ? "Console logs, errors, and warnings will appear here"
                    : "Try adjusting the log level filters above"}
                </div>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className={`${styles.logEntry} ${styles[log.level]}`}>
                  <div className={styles.logMeta}>
                    <div className={`${styles.logLevel} ${styles[log.level]}`}>{log.level}</div>
                    <div className={styles.logTime}>{formatTime(log.timestamp)}</div>
                  </div>
                  <div className={styles.logMessage}>{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.logCount}>
            {filteredLogs.length} of {logs.length} logs
          </div>

          <label className={styles.autoScroll}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className={styles.autoScrollCheckbox}
            />
            Auto-scroll
          </label>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DebugModal;
