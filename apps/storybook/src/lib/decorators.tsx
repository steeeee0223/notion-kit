import type { Decorator } from "@storybook/react";

import { AuthProvider } from "@notion-kit/auth-ui";

export const withAuth: Decorator = (Story) => {
  return (
    <AuthProvider>
      <Story />
    </AuthProvider>
  );
};
