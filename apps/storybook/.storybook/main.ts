import type { StorybookConfig } from "storybook-react-rsbuild";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../public"], //👈 Configures the static asset folder in Storybook
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
  ],
  features: {
    backgrounds: false, // 👈 disable the backgrounds feature
  },
  framework: {
    name: "storybook-react-rsbuild",
    options: {},
  },
};
export default config;
