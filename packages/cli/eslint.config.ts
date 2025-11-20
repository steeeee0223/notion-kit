import { defineConfig } from "eslint/config";

import { baseConfig } from "@notion-kit/eslint-config/base";

export default defineConfig({ ignores: ["dist/**"] }, baseConfig);
