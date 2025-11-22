import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export const reactConfig = defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    settings: {
      react: { version: "^19.2.0" },
    },
    plugins: {
      react: reactPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...reactPlugin.configs.flat["jsx-runtime"]?.rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/jsx-no-constructed-context-values": "warn",
    },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended?.languageOptions,
      ...reactPlugin.configs.flat["jsx-runtime"]?.languageOptions,
      globals: {
        React: "writable",
      },
    },
  },
  hooksPlugin.configs.flat["recommended-latest"],
);
