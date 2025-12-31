import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgo: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~components": path.resolve(__dirname, "./src/components"),
      "~features": path.resolve(__dirname, "./src/features"),
      "~hooks": path.resolve(__dirname, "./src/features/shared/hooks"),
      "~config": path.resolve(__dirname, "./src/config"),
      "~styles": path.resolve(__dirname, "./src/styles"),
      "~pages": path.resolve(__dirname, "./src/pages"),
      "~assets": path.resolve(__dirname, "./src/assets"),
      // Ensure React resolves to the same instance everywhere
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Put React and React DOM in a separate chunk to ensure single instance
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          return undefined;
        },
      },
      onwarn(warning, warn) {
        warn(warning);
      },
    },
  },
});
