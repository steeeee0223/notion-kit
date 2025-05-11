import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";

import "@/app/globals.css";

import { locales } from "@notion-kit/i18n";

import { withI18next, withTheme, withToast } from "./decorators";

// Initialize MSW
initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  loaders: [mswLoader],
  decorators: [withTheme, withI18next, withToast],
  globalTypes: {
    // Reference https://storybook.js.org/docs/essentials/toolbars-and-globals
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Internationalization locale",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: locales,
        dynamicTitle: true,
      },
    },
    initialGlobals: {
      theme: "light",
      locale: "en",
    },
  },
};

export default preview;
