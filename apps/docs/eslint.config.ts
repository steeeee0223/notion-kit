import { defineConfig } from "eslint/config";

import { baseConfig } from "@notion-kit/eslint-config/base";
import { reactConfig } from "@notion-kit/eslint-config/react";

export default defineConfig(
  {
    ignores: ["public/**", "src/stories/registry.lazy.tsx"],
  },
  baseConfig,
  reactConfig,
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      // React Router handles thrown HTTP responses as route errors.
      "@typescript-eslint/only-throw-error": [
        "error",
        { allow: [{ from: "lib", name: "Response" }] },
      ],
    },
  },
);
