import React, { useLayoutEffect } from "react";
import type { Decorator } from "@storybook/nextjs";

import { I18nProvider } from "@notion-kit/i18n";
import { ThemeProvider, Toaster, useTheme } from "@notion-kit/shadcn";

interface StorybookThemeWrapperProps extends React.PropsWithChildren {
  theme: string;
}

const StorybookThemeWrapper = ({
  theme,
  children,
}: StorybookThemeWrapperProps) => {
  const { setTheme } = useTheme();
  useLayoutEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return children;
};

export const withTheme: Decorator = (Story, context) => {
  const { theme = "system" } = context.globals;
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <StorybookThemeWrapper theme={theme as string}>
        <Story />
      </StorybookThemeWrapper>
    </ThemeProvider>
  );
};

export const withI18next: Decorator = (Story, context) => {
  const { locale } = context.globals;
  return (
    <I18nProvider language={locale as string}>
      <Story />
    </I18nProvider>
  );
};

export const withToast: Decorator = (Story) => (
  <>
    <Toaster />
    <Story />
  </>
);
