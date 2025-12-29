import { defineConfig } from "eslint/config";

import { baseConfig } from "@notion-kit/eslint-config/base";
import { reactConfig } from "@notion-kit/eslint-config/react";
import { storybookConfig } from "@notion-kit/eslint-config/storybook";

export default defineConfig(
  { ignores: ["public/**"] },
  baseConfig,
  reactConfig,
  storybookConfig,
);
