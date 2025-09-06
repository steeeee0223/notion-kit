import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { LoginForm } from "@notion-kit/auth-ui";

import { withAuth } from "@/lib/decorators";

const meta = {
  title: "auth/Login Form",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  args: {
    onModeChange: fn(),
  },
  decorators: [withAuth],
} satisfies Meta<typeof LoginForm>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    mode: "sign_in",
  },
};
