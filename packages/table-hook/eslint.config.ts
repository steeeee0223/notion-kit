import { defineConfig } from "eslint/config";

import { baseConfig } from "@notion-kit/eslint-config/base";
import { reactConfig } from "@notion-kit/eslint-config/react";

export default defineConfig({ ignores: ["dist/**"] }, baseConfig, reactConfig);
