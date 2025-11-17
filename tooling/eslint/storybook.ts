import storybookPlugin from "eslint-plugin-storybook";
import { defineConfig } from "eslint/config";

export const storybookConfig = defineConfig({
  ...storybookPlugin.configs["flat/recommended"],
  files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
});
