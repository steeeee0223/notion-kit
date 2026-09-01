import type React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { CellTrigger, CellTriggerScope } from "./cell-trigger";

function EventDelegationHarness({
  children,
  onClick,
  onKeyDown,
}: React.ComponentProps<"div">) {
  const delegatedEventProps = { onClick, onKeyDown };
  return <div {...delegatedEventProps}>{children}</div>;
}

it("CellTrigger_ClickAndKeyboardActivation_StopParentPropagationByDefault", () => {
  const parentClick = vi.fn();
  const parentKeyDown = vi.fn();
  const onClick = vi.fn();
  const onKeyDown = vi.fn();
  render(
    <EventDelegationHarness onClick={parentClick} onKeyDown={parentKeyDown}>
      <CellTrigger onClick={onClick} onKeyDown={onKeyDown}>
        Value
      </CellTrigger>
    </EventDelegationHarness>,
  );
  const trigger = screen.getByRole("button", { name: "Value" });

  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: "Enter" });

  expect(onClick).toHaveBeenCalledTimes(2);
  expect(onKeyDown).toHaveBeenCalledOnce();
  expect(parentClick).not.toHaveBeenCalled();
  expect(parentKeyDown).not.toHaveBeenCalled();
});

it("CellTrigger_PropagationOptOut_AllowsParentInteractions", () => {
  const parentClick = vi.fn();
  const parentKeyDown = vi.fn();
  render(
    <EventDelegationHarness onClick={parentClick} onKeyDown={parentKeyDown}>
      <CellTriggerScope stopPropagation={false}>
        <CellTrigger>Value</CellTrigger>
      </CellTriggerScope>
    </EventDelegationHarness>,
  );
  const trigger = screen.getByRole("button", { name: "Value" });

  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: "Enter" });

  expect(parentClick).toHaveBeenCalledTimes(2);
  expect(parentKeyDown).toHaveBeenCalledOnce();
});

it("CellTrigger_ScopeLabel_ProvidesTheAccessibleName", () => {
  render(
    <CellTriggerScope ariaLabel="Status: Done">
      <CellTrigger>Done</CellTrigger>
    </CellTriggerScope>,
  );

  expect(screen.getByRole("button", { name: "Status: Done" })).toBeVisible();
});

it("CellTrigger_ScopeClassName_IsAppliedToTheTrigger", () => {
  render(
    <CellTriggerScope className="text-sm">
      <CellTrigger>Feature</CellTrigger>
    </CellTriggerScope>,
  );

  expect(screen.getByRole("button", { name: "Feature" })).toHaveClass(
    "text-sm",
  );
});
