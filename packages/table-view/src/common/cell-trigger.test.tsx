import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { CellTrigger } from "./cell-trigger";

it("CellTrigger_ClickAndKeyboard_StopParentPropagationByDefault", () => {
  const parentClick = vi.fn();
  const parentKeyDown = vi.fn();
  const onClick = vi.fn();
  const onKeyDown = vi.fn();
  render(
    <div onClick={parentClick} onKeyDown={parentKeyDown}>
      <CellTrigger onClick={onClick} onKeyDown={onKeyDown}>
        Value
      </CellTrigger>
    </div>,
  );
  const trigger = screen.getByRole("button", { name: "Value" });

  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: "Enter" });

  expect(onClick).toHaveBeenCalledOnce();
  expect(onKeyDown).toHaveBeenCalledOnce();
  expect(parentClick).not.toHaveBeenCalled();
  expect(parentKeyDown).not.toHaveBeenCalled();
});

it("CellTrigger_PropagationOptOut_AllowsParentInteractions", () => {
  const parentClick = vi.fn();
  const parentKeyDown = vi.fn();
  render(
    <div onClick={parentClick} onKeyDown={parentKeyDown}>
      <CellTrigger stopPropagation={false}>Value</CellTrigger>
    </div>,
  );
  const trigger = screen.getByRole("button", { name: "Value" });

  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: "Enter" });

  expect(parentClick).toHaveBeenCalledOnce();
  expect(parentKeyDown).toHaveBeenCalledOnce();
});

it("CellTrigger_TooltipTitleAndDescription_AreShownOnHover", async () => {
  const user = userEvent.setup();
  render(
    <CellTrigger
      layout="board"
      tooltip={{ title: "Status", description: "Current workflow state" }}
    >
      Done
    </CellTrigger>,
  );

  await user.hover(screen.getByRole("button", { name: "Done" }));

  expect(await screen.findByText("Status")).toBeVisible();
  expect(screen.getByText("Current workflow state")).toBeVisible();
});

it("CellTrigger_TitleOnlyTooltip_IsShownOnHover", async () => {
  const user = userEvent.setup();
  render(
    <CellTrigger layout="list" widthType="select" tooltip={{ title: "Tags" }}>
      Feature
    </CellTrigger>,
  );

  await user.hover(screen.getByRole("button", { name: "Feature" }));

  expect(await screen.findByText("Tags")).toBeVisible();
});
