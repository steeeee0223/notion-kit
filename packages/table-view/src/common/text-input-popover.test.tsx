import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

import { TextInputPopoverContent } from "./text-input-popover";

function HeaderTriggerHarness({
  onUpdate,
  commitOnUnchanged,
}: {
  onUpdate: (value: string) => void;
  commitOnUnchanged?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<button type="button">Notes</button>} />
      <PopoverContent>
        <TextInputPopoverContent
          value=""
          commitOnUnchanged={commitOnUnchanged}
          onCancel={() => setOpen(false)}
          onUpdate={(value) => {
            onUpdate(value);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

it("TextInputPopoverContent_HeaderTrigger_CommitsOneResolvedFinalValue", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<HeaderTriggerHarness onUpdate={onUpdate} />);

  await user.click(screen.getByRole("button", { name: "Notes" }));
  const input = await screen.findByRole("textbox");
  await user.type(input, "Shared value{Enter}");

  expect(onUpdate).toHaveBeenCalledExactlyOnceWith("Shared value");
  await waitFor(() => expect(input).not.toBeInTheDocument());
});

it("TextInputPopoverContent_EmptyDraftWithCommitOnUnchanged_CommitsAnEmptyValue", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<HeaderTriggerHarness onUpdate={onUpdate} commitOnUnchanged />);

  await user.click(screen.getByRole("button", { name: "Notes" }));
  const input = await screen.findByRole("textbox");
  await user.type(input, "{Enter}");

  expect(onUpdate).toHaveBeenCalledExactlyOnceWith("");
});

it("TextInputPopoverContent_EmptyDraftWithCommitOnUnchanged_UpdatesOnBlur", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<HeaderTriggerHarness onUpdate={onUpdate} commitOnUnchanged />);

  await user.click(screen.getByRole("button", { name: "Notes" }));
  await screen.findByRole("textbox");
  await user.tab();

  expect(onUpdate).toHaveBeenCalledExactlyOnceWith("");
});

it("TextInputPopoverContent_HeaderTrigger_EscapeCancelsWithoutResolvingValue", async () => {
  const user = userEvent.setup();
  const onUpdate = vi.fn();
  render(<HeaderTriggerHarness onUpdate={onUpdate} />);

  await user.click(screen.getByRole("button", { name: "Notes" }));
  const input = await screen.findByRole("textbox");
  await user.type(input, "Discarded value");
  await user.keyboard("{Escape}");

  await waitFor(() => expect(input).not.toBeInTheDocument());
  expect(onUpdate).not.toHaveBeenCalled();
});
