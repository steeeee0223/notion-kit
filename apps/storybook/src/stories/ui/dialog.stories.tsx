import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay } from "msw";

import { AlertModal } from "@notion-kit/common/alert-modal";
import { Button, Dialog, DialogTrigger } from "@notion-kit/shadcn";

const meta = {
  title: "shadcn/Dialog",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="md">Open</Button>
        </DialogTrigger>
        <AlertModal
          title="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
          primary="Continue"
          secondary="Cancel"
          onTrigger={async () => {
            await delay(1500);
            setOpen(false);
          }}
        />
      </Dialog>
    );
  },
};
