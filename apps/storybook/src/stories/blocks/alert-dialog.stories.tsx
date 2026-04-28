import { delay } from "msw";
import type { Meta, StoryObj } from "storybook-react-rsbuild";

import { AlertDialog } from "@notion-kit/registry/alert-dialog";
import { Dialog } from "@notion-kit/shadcn";

const meta = {
  title: "registry/Alert Dialog",
  component: AlertDialog,
  parameters: { layout: "centered" },
  args: {
    onTrigger: () => delay(2000),
  },
  render: (args) => (
    <Dialog open>
      <AlertDialog {...args} />
    </Dialog>
  ),
} satisfies Meta<typeof AlertDialog>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Are you sure?",
    primary: "Yes",
    secondary: "Cancel",
  },
};
