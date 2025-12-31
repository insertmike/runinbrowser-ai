import { useEffect, useState, useCallback } from "react";

export interface ConsoleLogEntry {
  id: string;
  timestamp: Date;
  level: "log" | "info" | "warn" | "error";
  message: string;
  args: unknown[];
}

const MAX_LOGS = 1000;
const subscribers = new Set<(logs: ConsoleLogEntry[]) => void>();
let logs: ConsoleLogEntry[] = [];

// Helper to notify all subscribers
const notifySubscribers = () => {
  subscribers.forEach((callback) => callback([...logs]));
};

const addLog = (level: ConsoleLogEntry["level"], args: unknown[]) => {
  const entry: ConsoleLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level,
    message: args
      .map((arg) => {
        if (arg instanceof Error) {
          const name = arg.name || "Error";
          const msg = arg.message || String(arg);
          const stack = arg.stack ? `\n${arg.stack}` : "";
          return `${name}: ${msg}${stack}`;
        }
        if (arg && typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" "),
    args,
  };

  logs = [...logs, entry];
  if (logs.length > MAX_LOGS) {
    logs = logs.slice(-MAX_LOGS);
  }
  notifySubscribers();
};

// Initialize capture immediately
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

interface ExtendedConsole extends Console {
  __isCaptured?: boolean;
}

const capturedConsole = console as ExtendedConsole;

// Prevent double-patching if HMR re-runs this module
if (!capturedConsole.__isCaptured) {
  // Override console methods
  capturedConsole.log = (...args: unknown[]) => {
    originalConsole.log(...args);
    addLog("log", args);
  };

  capturedConsole.info = (...args: unknown[]) => {
    originalConsole.info(...args);
    addLog("info", args);
  };

  capturedConsole.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    addLog("warn", args);
  };

  capturedConsole.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    addLog("error", args);
  };

  capturedConsole.__isCaptured = true;

  // Capture unhandled errors
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      addLog("error", [
        `Uncaught Error: ${event.message}`,
        `at ${event.filename}:${event.lineno}:${event.colno}`,
      ]);
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason =
        event.reason instanceof Error
          ? `${event.reason.name}: ${event.reason.message}${
              event.reason.stack ? `\n${event.reason.stack}` : ""
            }`
          : typeof event.reason === "object"
            ? (() => {
                try {
                  return JSON.stringify(event.reason, null, 2);
                } catch {
                  return String(event.reason);
                }
              })()
            : String(event.reason);
      addLog("error", ["Unhandled Promise Rejection:", reason]);
    });
  }
}

export const useConsoleCapture = () => {
  const [currentLogs, setCurrentLogs] = useState<ConsoleLogEntry[]>(() => [...logs]);

  useEffect(() => {
    const callback = (newLogs: ConsoleLogEntry[]) => {
      setCurrentLogs(newLogs);
    };

    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }, []);

  const clearLogs = useCallback(() => {
    logs = [];
    notifySubscribers();
  }, []);

  return {
    logs: currentLogs,
    clearLogs,
  };
};
