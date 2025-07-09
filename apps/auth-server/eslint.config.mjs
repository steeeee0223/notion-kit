import baseConfig from "@notion-kit/eslint-config/base";
import nextjsConfig from "@notion-kit/eslint-config/nextjs";
import reactConfig from "@notion-kit/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  { ignores: ["public/**"] },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
