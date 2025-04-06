"use client";

import { useModal } from "@notion-kit/modal";
import { Button } from "@notion-kit/shadcn";

import { Modal } from "./modal";

export const Trigger = () => {
  const { openModal } = useModal();
  const handleClick = () =>
    openModal(
      <Modal title="Are you sure?" primary="Confirm" secondary="Cancel" />,
    );

  return (
    <Button size="md" onClick={handleClick}>
      Open
    </Button>
  );
};
