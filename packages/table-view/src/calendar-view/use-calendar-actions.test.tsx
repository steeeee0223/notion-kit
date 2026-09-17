import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { flushSync } from "react-dom";
import { expect, it, vi } from "vitest";

import type {
  DataResourceAction,
  ResourceChange,
  Row,
} from "@notion-kit/table-hook";
import type { CalendarEventValue } from "@notion-kit/ui/calendar";

import { TableViewWrapper, useTableViewCtx } from "@/table-contexts";

import { useCalendarActions } from "./use-calendar-actions";

const properties = [
  { id: "title", name: "Name", type: "title", config: { showIcon: false } },
  {
    id: "due",
    name: "Due",
    type: "date",
    config: { dateFormat: "full", timeFormat: "24-hour", tz: "UTC" },
  },
];
const initialRows: Row[] = [
  {
    id: "task",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      title: { id: "title-cell", value: "Task" },
      due: {
        id: "due-cell",
        value: { start: 0, includeTime: true, custom: "keep" },
      },
    },
  },
];
type Change = ResourceChange<Row[], DataResourceAction>;

function ActionsProbe({
  value,
  locked,
}: {
  value: CalendarEventValue;
  locked: boolean;
}) {
  const { table } = useTableViewCtx();
  const actions = useCalendarActions({
    propertyId: "due",
    timeZone: "UTC",
    locked,
  });
  return (
    <>
      <button onClick={() => table.setSorting([{ id: "title", desc: false }])}>
        Sort
      </button>
      <button onClick={() => actions.onCreate(value)}>Create</button>
      <button
        onClick={() =>
          actions.onEventChange({ ...value, id: "task", reason: "move" })
        }
      >
        Move
      </button>
      <button
        onClick={() =>
          actions.onEventChange({ ...value, id: "task", reason: "resize-end" })
        }
      >
        Resize
      </button>
      <button
        onClick={() =>
          actions.onEventChange({ ...value, id: "task", reason: "convert" })
        }
      >
        Convert
      </button>
      <table.Subscribe selector={(state) => state.tableGlobal.openedRowId}>
        {(id) => <output aria-label="opened row">{id}</output>}
      </table.Subscribe>
      <output aria-label="rows">{JSON.stringify(table.options.data)}</output>
      <table.Subscribe selector={(state) => state.sorting}>
        {(sorting) => (
          <output aria-label="sorting">{JSON.stringify(sorting)}</output>
        )}
      </table.Subscribe>
    </>
  );
}

function Harness({
  accept = true,
  flushAcceptance = false,
  locked = false,
  value,
  onChange,
}: {
  accept?: boolean;
  flushAcceptance?: boolean;
  locked?: boolean;
  value: CalendarEventValue;
  onChange: (change: Change) => void;
}) {
  const [data, setData] = useState(initialRows);
  return (
    <TableViewWrapper
      data={data}
      properties={properties}
      defaultView={{
        layout: "calendar",
        locked,
        dateView: { datePropertyId: "due" },
      }}
      onDataChange={(change) => {
        onChange(change);
        if (!accept) return;
        if (flushAcceptance) flushSync(() => setData(change.next));
        else setData(change.next);
      }}
    >
      <ActionsProbe value={value} locked={locked} />
    </TableViewWrapper>
  );
}

it.each([
  [
    "all-day",
    { startAt: 86400000, endAt: null, allDay: true },
    { start: 86400000, endDate: false, includeTime: false },
    false,
  ],
  [
    "timed",
    { startAt: 90000000, endAt: 93600000, allDay: false },
    { start: 90000000, end: 93600000, endDate: true, includeTime: true },
    false,
  ],
  [
    "synchronous timed",
    { startAt: 90000000, endAt: 93600000, allDay: false },
    { start: 90000000, end: 93600000, endDate: true, includeTime: true },
    true,
  ],
] as const)(
  "CalendarCreate_%sAccepted_WritesInitialDateOnceThenOpensAuthoritativeRow",
  async (_name, value, expected, flushAcceptance) => {
    const onChange = vi.fn<(change: Change) => void>();
    render(
      <Harness
        value={value}
        onChange={onChange}
        flushAcceptance={flushAcceptance}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const change = onChange.mock.calls[0]![0];
    expect(change.action.type).toBe("data.row.create");
    const added = change.next[1]!;
    expect(added.properties.due?.value).toEqual(expected);
    await waitFor(() =>
      expect(screen.getByLabelText("opened row")).toHaveTextContent(added.id),
    );
  },
);

it("CalendarCreate_RejectedOwner_NeverOpensOrRetriesProposedRow", async () => {
  const onChange = vi.fn<(change: Change) => void>();
  render(
    <Harness
      accept={false}
      value={{ startAt: 0, endAt: null, allDay: true }}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  expect(screen.getByLabelText("opened row")).toBeEmptyDOMElement();
  expect(screen.getByLabelText("rows")).toHaveTextContent(
    JSON.stringify(initialRows),
  );
});

it.each([
  [
    "Move",
    { startAt: 90000000, endAt: null, allDay: false },
    { start: 90000000, endDate: false, includeTime: true, custom: "keep" },
  ],
  [
    "Resize",
    { startAt: 0, endAt: 900000, allDay: false },
    { start: 0, end: 900000, endDate: true, includeTime: true, custom: "keep" },
  ],
  [
    "Convert",
    { startAt: 86400000, endAt: 259200000, allDay: true },
    {
      start: 86400000,
      end: 172800000,
      endDate: true,
      includeTime: false,
      custom: "keep",
    },
  ],
] as const)(
  "CalendarChange_%s_UpdatesOneCellWithoutChangingSortingOrRowOrder",
  async (action, value, expected) => {
    const onChange = vi.fn<(change: Change) => void>();
    render(<Harness value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    expect(screen.getByLabelText("sorting")).toHaveTextContent(
      '[ {"id":"title","desc":false} ]'.replaceAll(" ", ""),
    );
    fireEvent.click(screen.getByRole("button", { name: action }));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    const change = onChange.mock.calls[0]![0];
    expect(change.action).toMatchObject({
      type: "data.cell.update",
      payload: { rowId: "task", propertyId: "due" },
    });
    expect(change.next.map((row) => row.id)).toEqual(["task"]);
    expect(change.next[0]?.properties.due).toEqual({
      id: "due-cell",
      value: expected,
    });
    expect(screen.getByLabelText("sorting")).toHaveTextContent(
      '[{"id":"title","desc":false}]',
    );
  },
);

it("CalendarChange_RejectedOwner_KeepsAuthoritativeDate", () => {
  const onChange = vi.fn<(change: Change) => void>();
  render(
    <Harness
      accept={false}
      value={{ startAt: 100, endAt: null, allDay: false }}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Move" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("rows")).toHaveTextContent(
    JSON.stringify(initialRows),
  );
});

it("CalendarActions_Locked_DoesNotCreateOrChangeData", () => {
  const onChange = vi.fn<(change: Change) => void>();
  render(
    <Harness
      locked
      value={{ startAt: 100, endAt: null, allDay: false }}
      onChange={onChange}
    />,
  );
  for (const name of ["Create", "Move", "Resize", "Convert"])
    fireEvent.click(screen.getByRole("button", { name }));
  expect(onChange).not.toHaveBeenCalled();
});
