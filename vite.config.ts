/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Configurazione Vite: alias @ → src, proxy /api verso il backend Spring in dev,
// test con jsdom (Vitest). La build statica finisce in dist/ (servibile da Spring o Nginx).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    // gli e2e sono di Playwright, non di Vitest: senza exclude verrebbero
    // importati da Vitest e fallirebbero ("test() called here")
    exclude: ["e2e/**", "node_modules/**"],
  },
});
