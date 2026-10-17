import type { ComponentProps } from "react";

import { AuthProvider, CreateWorkspaceForm } from "@notion-kit/auth-ui";

const DefaultContent = () => {
  const args = {} satisfies Partial<ComponentProps<typeof CreateWorkspaceForm>>;
  return <CreateWorkspaceForm {...args} />;
};

export function DefaultExample() {
  return (
    <AuthProvider>
      <DefaultContent />
    </AuthProvider>
  );
}
