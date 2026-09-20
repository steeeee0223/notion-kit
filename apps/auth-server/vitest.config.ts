import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "auth-server",
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
