import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Kanban, type KanbanValue } from "./kanban";

vi.mock("@/primitives", async () => {
  const React = await import("react");
  const { composeRefs } = await import("@/primitives/compose-refs");
  const List = React.forwardRef<HTMLDivElement, { children: ReactNode }>(
    ({ children }, ref) => <div ref={ref}>{children}</div>,
  );
  const Item = React.forwardRef<
    HTMLDivElement,
    {
      children: ReactNode;
      "data-kanban-id"?: string;
    }
  >(({ children, "data-kanban-id": id }, ref) => (
    <div ref={ref} data-kanban-id={id}>
      {children}
    </div>
  ));
  const Handle = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button">
  >((props, ref) => (
    <button {...props} ref={ref} data-slot="sortable-handle" />
  ));
  return {
    composeRefs,
    Sortable: {
      Root: ({ children }: { children: ReactNode }) => children,
      List,
      Item,
      Handle,
      Overlay: () => null,
    },
  };
});

const initial: KanbanValue = {
  columnOrder: ["todo", "done"],
  items: { todo: ["a"], done: [] },
};
const accepted: KanbanValue = { ...initial, items: { todo: [], done: ["a"] } };
function Board({ value, name }: { value: KanbanValue; name: string }) {
  return (
    <section aria-label={name}>
      <Kanban.Root
        value={value}
        onMove={() => undefined}
        renderOverlay={() => null}
      >
        {(projected) =>
          projected.columnOrder.map((columnId) => (
            <div key={columnId}>
              {projected.items[columnId]?.map((id, index) => (
                <Kanban.Item key={id} id={id} index={index} group={columnId}>
                  <Kanban.ItemHandle />
                </Kanban.Item>
              ))}
            </div>
          ))
        }
      </Kanban.Root>
    </section>
  );
}

it("DelayedAcceptance_ReparentedFocusedHandle_RegainsFocusWithinItsOwnBoard", async () => {
  const { rerender } = render(
    <>
      <Board name="First" value={initial} />
      <Board name="Second" value={initial} />
    </>,
  );
  const first = within(screen.getByRole("region", { name: "First" }));
  const second = within(screen.getByRole("region", { name: "Second" }));
  const oldHandle = second.getByRole("button");
  oldHandle.focus();

  rerender(
    <>
      <Board name="First" value={initial} />
      <Board name="Second" value={accepted} />
    </>,
  );

  await waitFor(() => expect(second.getByRole("button")).toHaveFocus());
  expect(second.getByRole("button")).not.toBe(oldHandle);
  expect(first.getByRole("button")).not.toHaveFocus();
});

it("DelayedAcceptance_UserMovedFocus_DoesNotStealItBack", async () => {
  const { rerender } = render(
    <>
      <Board name="Board" value={initial} />
      <button>Continue</button>
    </>,
  );
  within(screen.getByRole("region", { name: "Board" }))
    .getByRole("button")
    .focus();
  const next = screen.getByRole("button", { name: "Continue" });
  next.focus();

  rerender(
    <>
      <Board name="Board" value={accepted} />
      <button>Continue</button>
    </>,
  );

  await waitFor(() => expect(next).toHaveFocus());
});
