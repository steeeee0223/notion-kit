import { useState } from "react";
import { functionalUpdate } from "@tanstack/react-table";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { DataResourceAction, Row } from "@notion-kit/table-hook";
import type { DateConfig, DateData } from "@notion-kit/table-hook/plugins";

import { renderTableView } from "@/__tests__/component-objects/render-table-view";
import {
  createFullPluginFixture,
  createResourceProbe,
  mockResizeObserver,
} from "@/__tests__/mock";
import { CellEditorHost } from "@/common/cell-editor-host";

import { date as createDate } from "../plugin";
import { DatePickerCellValue } from "./date-picker-cell";
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
  const plugin = createDate();
  return (
    <>
      <CellEditorHost
        plugin={plugin}
        valueProps={{
          propId: "due",
          row,
          data,
          config: currentConfig,
          layout: "table",
        }}
        editorProps={{
          propId: "due",
          data,
          config: currentConfig,
          layout: "table",
          scope: { kind: "cell", row },
          onChange: (updater) =>
            setData((previous) => functionalUpdate(updater, previous)),
          onConfigChange: (updater) =>
            setConfig((previous) => functionalUpdate(updater, previous)),
        }}
      />
      <output data-testid="date-state">{JSON.stringify(data)}</output>
      <output data-testid="date-config">{JSON.stringify(currentConfig)}</output>
    </>
  );
}

it("DatePicker_EndTimeFormatsAndClear_UpdateCanonicalState", async () => {
  const user = userEvent.setup();
  render(
    <DateCellHarness initial={{ start: Date.UTC(2025, 0, 15, 13, 45) }} />,
  );
  await user.click(screen.getByRole("button", { name: "January 15, 2025" }));

  await user.click(screen.getByRole("switch", { name: "End date" }));
  expect(screen.getByTestId("date-state")).toHaveTextContent('"endDate":true');
  expect(screen.getAllByRole("textbox")).toHaveLength(2);

  await user.click(screen.getByRole("switch", { name: "Include time" }));
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    '"includeTime":true',
  );
  expect(screen.getAllByRole("textbox")).toHaveLength(4);

  await user.click(screen.getByRole("menuitem", { name: /Date format/i }));
  await user.click(
    await screen.findByRole("menuitemradio", { name: "Short date" }),
  );
  expect(screen.getByTestId("date-config")).toHaveTextContent(
    '"dateFormat":"short"',
  );

  await user.click(screen.getByRole("menuitem", { name: /Time format/i }));
  await user.click(
    await screen.findByRole("menuitemradio", { name: "12 hour" }),
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

function ControlledDateRangeHarness() {
  const [value, setValue] = useState<DateData>({});
  return (
    <>
      <button
        type="button"
        onClick={() => setValue({ start: Date.UTC(2025, 0, 15) })}
      >
        Set date
      </button>
      <DateRangeInput value={value} onChange={setValue} tz="UTC" />
    </>
  );
}

it("DateRangeInput_ControlledDateChange_UpdatesTheVisibleDateInput", async () => {
  const user = userEvent.setup();
  render(<ControlledDateRangeHarness />);
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("");

  await user.click(screen.getByRole("button", { name: "Set date" }));

  expect(input).toHaveValue("2025-01-15");
});

it("DateTimePicker_RangeSelection_UpdatesBothDateBoundaries", async () => {
  // Arrange
  const user = userEvent.setup();
  render(
    <DateCellHarness
      initial={{
        start: Date.UTC(2025, 0, 15),
        end: Date.UTC(2025, 0, 16),
        endDate: true,
      }}
    />,
  );
  await user.click(screen.getByRole("button", { name: /January 15, 2025/i }));
  await user.click(
    screen.getByRole("button", { name: /Tuesday, January 14/i }),
  );
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    String(Date.UTC(2025, 0, 14)),
  );
  await user.click(screen.getByRole("button", { name: /next month/i }));

  // Act
  await user.click(
    screen.getByRole("button", { name: /Sunday, February 16/i }),
  );

  // Assert
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    JSON.stringify({
      start: Date.UTC(2025, 0, 14),
      end: Date.UTC(2025, 1, 16),
      endDate: true,
    }),
  );
});

it("DateTimePicker_SelectedSingleDateClick_RetainsTheExistingBoundary", async () => {
  // Arrange
  const user = userEvent.setup();
  const start = Date.UTC(2025, 0, 15);
  render(<DateCellHarness initial={{ start }} />);
  await user.click(screen.getByRole("button", { name: "January 15, 2025" }));

  // Act
  await user.click(
    screen.getByRole("button", { name: /Wednesday, January 15/i }),
  );

  // Assert
  expect(screen.getByTestId("date-state")).toHaveTextContent(
    JSON.stringify({ start }),
  );
});

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

it("DateRangeInput_UnchangedBlur_DoesNotReportRedundantTimestamp", async () => {
  // Arrange
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <DateRangeInput
      value={{ start: Date.UTC(2025, 0, 15) }}
      onChange={onChange}
      tz="UTC"
    />,
  );
  const input = screen.getByRole("textbox");

  // Act
  await user.click(input);
  await user.tab();

  // Assert
  expect(onChange).not.toHaveBeenCalled();
});

it("DateRangeInput_UnchangedDateTimeBlur_DoesNotReportRedundantTimestamp", async () => {
  // Arrange
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <DateRangeInput
      value={{ includeTime: true, start: Date.UTC(2025, 0, 15, 13, 45) }}
      onChange={onChange}
      tz="UTC"
    />,
  );
  const [dateInput, timeInput] = screen.getAllByRole("textbox");

  // Act
  await user.click(dateInput!);
  await user.click(timeInput!);
  await user.tab();

  // Assert
  expect(onChange).not.toHaveBeenCalled();
});

it("DateRangeInput_UntouchedEmptyThenInvalidBlur_SuppressesOnlyEmptyMutation", async () => {
  // Arrange
  const user = userEvent.setup();
  render(<DateRangeHarness initial={{}} />);
  const input = screen.getByRole("textbox");

  // Act
  await user.click(input);
  await user.tab();

  // Assert
  expect(screen.getByTestId("range-state")).toHaveTextContent("{}");

  // Act
  await user.click(input);
  await user.type(input, "not-a-date");
  await user.tab();

  // Assert
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByTestId("range-state")).toHaveTextContent('"start":-1');
});

it("DatePicker_EmptyBoardAndRowView_RespectDisplayBoundary", () => {
  const { container, rerender } = render(
    <DatePickerCellValue
      propId="due"
      row={row}
      data={{}}
      config={config}
      layout="board"
    />,
  );
  expect(container).toBeEmptyDOMElement();

  rerender(
    <DatePickerCellValue
      propId="due"
      row={row}
      data={{}}
      config={config}
      layout="row-view"
    />,
  );
  expect(screen.getByText("Empty")).toBeVisible();
});

it("DatePicker_NextMonthDateSelection_EmitsExactCellResourcePayload", async () => {
  // Arrange
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const table = renderTableView({
    ...createFullPluginFixture(),
    onDataChange: dataProbe.onChange,
  });
  await table.user.click(table.cellButton("Alpha", "January 1, 2025"));

  // Act
  await table.user.click(screen.getByRole("button", { name: /next month/i }));
  await table.user.click(
    screen.getByRole("button", { name: /Friday, February 14/i }),
  );

  // Assert
  await waitFor(() => expect(dataProbe.onChange).toHaveBeenCalledOnce());
  expect(dataProbe.lastChange().action.type).toBe("data.cell.update");
  expect(dataProbe.lastChange().action.payload).toEqual({
    rowId: "row-alpha",
    propertyId: "due",
    previousValue: { start: Date.UTC(2025, 0, 1) },
    nextValue: { start: Date.UTC(2025, 1, 14), end: undefined },
  });
});

it("DatePicker_EscapeAfterTyping_CancelsWithoutResourceChange", async () => {
  // Arrange
  const dataProbe = createResourceProbe<Row[], DataResourceAction>();
  const table = renderTableView({
    ...createFullPluginFixture(),
    onDataChange: dataProbe.onChange,
  });
  await table.user.click(table.cellButton("Alpha", "January 1, 2025"));
  const input = await screen.findByRole("textbox");
  await table.user.clear(input);
  await table.user.type(input, "2025-02-14");

  // Act
  await table.user.keyboard("{Escape}");

  // Assert
  await waitFor(() => expect(input).not.toBeInTheDocument());
  expect(table.row("Alpha")).toHaveTextContent("January 1, 2025");
  expect(dataProbe.onChange).not.toHaveBeenCalled();
});
