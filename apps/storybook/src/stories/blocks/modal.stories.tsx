import type { Meta, StoryObj } from "@storybook/nextjs";

import { BaseModal } from "@notion-kit/common";
import { ModalProvider, useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

const meta = {
  title: "blocks/Modal",
  parameters: { layout: "centered" },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const Trigger = () => {
  const { openModal, closeModal } = useModal();
  const handleClick = () =>
    openModal(
      <BaseModal
        title="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        primary="Continue"
        secondary="Cancel"
        onTrigger={closeModal}
      />,
    );
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
