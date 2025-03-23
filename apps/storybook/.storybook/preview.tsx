import React from "react";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { Toaster } from "sonner";

import "../src/app/globals.css";

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
    docs: { toc: true },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
    // this should be placed at the end, otherwise
    // CANNOT RENDER HOOKS in STORIES
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
