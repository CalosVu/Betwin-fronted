import { defineConfig } from "@playwright/test";

/**
 * E2E Playwright (piano §11.1): flussi completi su browser reale, contro il
 * dev server Vite (che fa proxy verso il backend). Prerequisiti (collaudo):
 * backend su :8080 con dati, `npx playwright install`, poi `npx playwright test`.
 */
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
