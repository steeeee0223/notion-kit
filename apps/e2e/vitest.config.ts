import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "e2e",
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    testTimeout: 20_000,
  },
  resolve: {
    conditions: ["default"],
  },
});
