import storybookPlugin from "eslint-plugin-storybook";
import type { Config } from "eslint/config";

export const storybookConfig = {
  ...storybookPlugin.configs["flat/recommended"],
  files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
} satisfies Config;
