import debug from "debug";

/**
 * Logger instance for the runinbrowser library.
 *
 * To enable logging in the browser, set:
 * ```javascript
 * localStorage.debug = 'runinbrowser';
 * ```
 *
 * Or use the enableDebug() helper function exported from the main package.
 */
const baseLog = debug("runinbrowser");

/**
 * Logger with support for different log levels.
 * All logs are controlled by the 'runinbrowser' namespace.
 */
export const log = Object.assign(baseLog, {
  /**
   * Log an error message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser'
   */
  error: baseLog,
  /**
   * Log a warning message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser'
   */
  warn: baseLog,
  /**
   * Log an info message.
   * Only outputs when debug is enabled via localStorage.debug = 'runinbrowser'
   */
  info: baseLog,
} as const);
