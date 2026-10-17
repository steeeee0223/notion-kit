import type { ComponentProps } from "react";

import { AcceptInvitationForm, AuthProvider } from "@notion-kit/auth-ui";

interface DefaultProps {
  invitationId?: ComponentProps<typeof AcceptInvitationForm>["invitationId"];
}
const DefaultContent = (overrides: DefaultProps) => {
  const args = {
    invitationId: "test-invitation-id",
    ...overrides,
  } satisfies Partial<ComponentProps<typeof AcceptInvitationForm>>;
  return <AcceptInvitationForm {...args} />;
};

export function DefaultExample(props: DefaultProps) {
  return (
    <AuthProvider>
      <DefaultContent {...props} />
    </AuthProvider>
  );
}
