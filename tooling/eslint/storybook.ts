import storybookPlugin from "eslint-plugin-storybook";

export const storybookConfig = [
  ...storybookPlugin.configs["flat/recommended"],
  { files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"] },
];
