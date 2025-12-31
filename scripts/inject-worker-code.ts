import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const workerBundlePath = join(rootDir, "dist/core/engines/mlc/worker.bundle.js");
const workerUtilsPath = join(rootDir, "src/core/engines/mlc/worker-utils.ts");

try {
  // Read the bundled worker code
  const workerCode = readFileSync(workerBundlePath, "utf-8");

  // Escape the code for use in a template string
  const escapedCode = workerCode
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/`/g, "\\`") // Escape backticks
    .replace(/\${/g, "\\${"); // Escape template string interpolations

  // Generate the worker-utils.ts file
  const workerUtilsContent = `/**
 * @fileoverview
 * This file is AUTO-GENERATED. Do not edit manually.
 * 
 * Generated from: dist/core/engines/mlc/worker.bundle.js
 * 
 * This file contains the bundled worker code as a string constant,
 * allowing the worker to be created from a Blob URL without requiring
 * separate file handling or bundler configuration.
 */

/**
 * Bundled worker code as a string.
 * This is a self-contained IIFE bundle that includes all dependencies.
 */
export const WORKER_CODE = \`${escapedCode}\`;

/**
 * Creates a Web Worker from the bundled worker code using a Blob URL.
 * This approach requires no bundler configuration - the worker code is
 * bundled inline in the library.
 * 
 * @returns A new Worker instance
 */
export function createMLCWorker(): Worker {
  interface WorkerWithCleanup extends Worker {
    _blobUrl?: string;
  }

  const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl, {
    type: "classic",
    name: "mlc-worker",
  }) as WorkerWithCleanup;

  // Store the URL for cleanup
  worker._blobUrl = workerUrl;

  // Override terminate to clean up the blob URL
  const originalTerminate = worker.terminate.bind(worker);
  worker.terminate = function (this: WorkerWithCleanup) {
    if (this._blobUrl) {
      URL.revokeObjectURL(this._blobUrl);
      delete this._blobUrl;
    }
    originalTerminate();
  };

  return worker;
}
`;

  writeFileSync(workerUtilsPath, workerUtilsContent, "utf-8");
  console.log("✓ Worker code injected into worker-utils.ts");
} catch (error) {
  console.error("Failed to inject worker code:", error);
  process.exit(1);
}
