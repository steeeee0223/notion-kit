import type { Meta, StoryObj } from "@storybook/react";

import { ModalProvider, useModal } from "@notion-kit/modal";
import { Button, Dialog, DialogClose, DialogContent } from "@notion-kit/shadcn";

const meta = {
  title: "blocks/Modal",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const Modal = () => {
  const { isOpen, closeModal } = useModal();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent noTitle className="flex items-center text-2xl font-bold">
        Modal
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

const Trigger = () => {
  const { openModal } = useModal();
  const handleClick = () => openModal(<Modal />);
  return (
    <Button size="md" onClick={handleClick}>
      Open
    </Button>
  );
};

export const Default: Story = {
  render: () => (
    <ModalProvider>
      <Trigger />
    </ModalProvider>
  ),
};
