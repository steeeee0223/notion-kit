import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AcceptInvitationForm } from "@notion-kit/auth-ui";

import { withAuth } from "@/lib/decorators";

const meta = {
  title: "auth/Accept Invitation Form",
  component: AcceptInvitationForm,
  parameters: {
    layout: "centered",
  },
  decorators: [withAuth],
} satisfies Meta<typeof AcceptInvitationForm>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    invitationId: "test-invitation-id",
  },
};
