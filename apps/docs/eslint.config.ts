import { defineConfig } from "eslint/config";

import { baseConfig } from "@notion-kit/eslint-config/base";
import { nextjsConfig } from "@notion-kit/eslint-config/nextjs";
import { reactConfig } from "@notion-kit/eslint-config/react";

export default defineConfig(
  { ignores: ["public/**"] },
  baseConfig,
  reactConfig,
  nextjsConfig,
);
