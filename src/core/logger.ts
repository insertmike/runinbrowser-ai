import debug from "debug";

/**
 * Logger instance for the runinbrowser-ai library.
 *
 * To enable logging in the browser, set:
 * ```javascript
 * localStorage.debug = 'runinbrowser-ai';
 * ```
 *
 * Or use the enableDebug() helper function exported from the main package.
 */
const baseLog = debug("runinbrowser-ai");

/**
 * Logger with support for different log levels.
 * All logs are controlled by the 'runinbrowser-ai' namespace.
 */
export const log = Object.assign(baseLog, {
  /**
   * Log an error message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser-ai'
   */
  error: baseLog,
  /**
   * Log a warning message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser-ai'
   */
  warn: baseLog,
  /**
   * Log an info message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser-ai'
   */
  info: baseLog,
} as const);
