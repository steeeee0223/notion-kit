import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  test: {
    name: "map-server",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
