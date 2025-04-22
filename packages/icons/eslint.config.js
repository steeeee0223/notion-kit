import baseConfig from "@notion-kit/eslint-config/base";
import reactConfig from "@notion-kit/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
