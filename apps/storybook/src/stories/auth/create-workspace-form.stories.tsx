import type { Meta, StoryObj } from "@storybook/react";

import { CreateWorkspaceForm } from "@notion-kit/auth-ui";

import { withAuth } from "@/lib/decorators";

const meta = {
  title: "auth/Create Workspace Form",
  component: CreateWorkspaceForm,
  parameters: {
    layout: "centered",
  },
  decorators: [withAuth],
} satisfies Meta<typeof CreateWorkspaceForm>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
