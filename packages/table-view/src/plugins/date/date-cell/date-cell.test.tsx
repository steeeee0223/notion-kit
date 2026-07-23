import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import type { Row } from "@notion-kit/table-hook";

import { mockResizeObserver } from "@/__tests__/mock";

import type { DateConfig, DateData } from "../types";
import { DatePickerCell } from "./date-picker-cell";
import { DateRangeInput } from "./date-range-input";

mockResizeObserver();

const row: Row = {
  id: "row",
  createdAt: 0,
  lastEditedAt: 0,
  properties: {},
};
const config: DateConfig = {
  dateFormat: "full",
  timeFormat: "24-hour",
  tz: "UTC",
};

function DateCellHarness({ initial }: { initial: DateData }) {
  const [data, setData] = useState(initial);
  const [currentConfig, setConfig] = useState(config);
  return (
    <>
      <DatePickerCell
        propId="due"
        row={row}
        data={data}
        config={currentConfig}
        layout="table"
        onChange={setData}
        onConfigChange={setConfig}
      />
      <output data-testid="date-state">{JSON.stringify(data)}</output>
      <output data-testid="date-config">
        {JSON.stringify(currentConfig)}
      </output>
    </>
  );
}

it("DatePicker_EndTimeFormatsAndClear_UpdateCanonicalState", async () => {
  const user = userEvent.setup();
  render(
    <DateCellHarness initial={{ start: Date.UTC(2025, 0, 15, 13, 45) }} />,
  );
  await user.click(
    screen.getByRole("button", { name: "January 15, 2025" }),
  );

  await user.click(screen.getByRole("switch", { name: "End date" }));
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    '"endDate":true',
  );
  expect(screen.getAllByRole("textbox")).toHaveLength(2);

  await user.click(screen.getByRole("switch", { name: "Include time" }));
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    '"includeTime":true',
  );
  expect(screen.getAllByRole("textbox")).toHaveLength(4);

  await user.click(screen.getByRole("menuitem", { name: /Date format/i }));
  await user.click(
    await screen.findByRole("menuitemcheckbox", { name: "Short date" }),
  );
  expect(screen.getByTestId("date-config")).toHaveTextContent(
    '"dateFormat":"short"',
  );

  await user.click(screen.getByRole("menuitem", { name: /Time format/i }));
  await user.click(
    await screen.findByRole("menuitemcheckbox", { name: "12 hour" }),
  );
  expect(screen.getByTestId("date-config")).toHaveTextContent(
    '"timeFormat":"12-hour"',
  );

  await user.click(screen.getByRole("menuitem", { name: "Clear" }));
  expect(screen.getByTestId("date-state")).not.toHaveTextContent('"start"');
  expect(screen.getByTestId("date-state")).not.toHaveTextContent('"end"');
});

function DateRangeHarness({ initial }: { initial: DateData }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DateRangeInput value={value} onChange={setValue} tz="UTC" />
      <output data-testid="range-state">{JSON.stringify(value)}</output>
    </>
  );
}

it("DateRangeInput_InvalidThenValidDate_ReportsErrorAndTimestamp", async () => {
  const user = userEvent.setup();
  render(<DateRangeHarness initial={{}} />);
  const input = screen.getByRole("textbox");

  await user.type(input, "not-a-date");
  await user.tab();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByTestId("range-state")).toHaveTextContent('"start":-1');

  await user.click(input);
  await user.clear(input);
  await user.type(input, "2025-01-15");
  await user.tab();
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(screen.getByTestId("range-state")).toHaveTextContent(
    String(Date.UTC(2025, 0, 15)),
  );
});

it("DateRangeInput_DateTimeBoundaries_UpdateStartAndEndIndependently", async () => {
  const user = userEvent.setup();
  render(
    <DateRangeHarness
      initial={{ includeTime: true, endDate: true, start: -1, end: -1 }}
    />,
  );
  const range = screen.getByTestId("range-state").previousElementSibling!;
  const inputs = within(range as HTMLElement).getAllByRole("textbox");
  expect(inputs).toHaveLength(4);

  await user.type(inputs[0]!, "2025-01-15");
  await user.click(inputs[1]!);
  await user.clear(inputs[1]!);
  await user.type(inputs[1]!, "13:45:00");
  await user.tab();
  expect(screen.getByTestId("range-state")).toHaveTextContent(
    String(Date.UTC(2025, 0, 15, 13, 45)),
  );

  await user.type(inputs[2]!, "invalid");
  await user.tab();
  expect(screen.getByTestId("range-state")).toHaveTextContent('"end":-1');
});

it("DatePicker_EmptyBoardAndRowView_RespectDisplayBoundary", () => {
  const { container, rerender } = render(
    <DatePickerCell
      propId="due"
      row={row}
      data={{}}
      config={config}
      layout="board"
      onChange={() => undefined}
    />,
  );
  expect(container).toBeEmptyDOMElement();

  rerender(
    <DatePickerCell
      propId="due"
      row={row}
      data={{}}
      config={config}
      layout="row-view"
      onChange={() => undefined}
    />,
  );
  expect(screen.getByText("Empty")).toBeVisible();
});
