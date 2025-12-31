import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/core/engines/mlc/worker.ts"],
  format: ["iife"],
  outDir: "dist/core/engines/mlc",
  outExtension: () => ({ js: ".bundle.js" }),
  splitting: false,
  sourcemap: false,
  clean: false, // Don't clean, we need to preserve this for the main build
  treeshake: true,
  minify: true,
  target: "es2020",
  noExternal: ["@mlc-ai/web-llm"], // Bundle all dependencies
});
