import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as PluginOption],
  test: {
    name: "map",
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
