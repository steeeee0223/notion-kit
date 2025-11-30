import { DefaultIcon } from "../../common";
import { compareNumbers, createCompareFn } from "../utils";
import { DateCell, DatePickerCell } from "./date-cell";
import { DateConfigMenu } from "./date-config-menu";
import type {
  CreatedTimePlugin,
  DatePlugin,
  LastEditedTimePlugin,
} from "./types";
import { toDateString } from "./utils";

export function date(): DatePlugin {
  const id = "date";
  const name = "Date";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    meta: {
      name,
      icon: <DefaultIcon type={id} className="fill-menu-icon" />,
      desc: "Accepts a date or a date range (time optional). Useful for deadlines, especially with calendar and timeline views.",
    },
    default: {
      name,
      icon: <DefaultIcon type={id} />,
      data: {},
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromReadableValue: () => ({}),
    toReadableValue: (data) => {
      if (data.start === undefined) return "";
      return data.start.toString();
    },
    toTextValue: (data) =>
      toDateString(data, { dateFormat: "full", timeFormat: "24-hour", tz }),
    compare: createCompareFn<DatePlugin>((a, b) => {
      if (a.start === undefined && b.start === undefined) return 0;
      // undefined sorts after defined values
      if (a.start === undefined) return 1;
      if (b.start === undefined) return -1;
      return compareNumbers(a.start, b.start);
    }),
    renderCell: (props) => <DatePickerCell {...props} />,
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}

export function createdTime(): CreatedTimePlugin {
  const id = "created-time";
  const name = "Created Time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    meta: {
      name,
      icon: <DefaultIcon type={id} className="fill-menu-icon" />,
      desc: "Records the timestamp of an item's creation. Auto-generated and not editable.",
    },
    default: {
      name,
      icon: <DefaultIcon type={id} />,
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromReadableValue: () => null,
    toReadableValue: (_, row) => row.createdAt.toString(),
    toTextValue: (_, row) =>
      toDateString(
        { start: row.createdAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    compare: (rowA, rowB) => compareNumbers(rowA.createdAt, rowB.createdAt),
    renderCell: ({ row, config, wrapped, disabled }) => (
      <DateCell
        data={{ start: row.createdAt, includeTime: true }}
        config={config}
        wrapped={wrapped}
        disabled={disabled}
      />
    ),
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}

export function lastEditedTime(): LastEditedTimePlugin {
  const id = "last-edited-time";
  const name = "Last Edited Time";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    id,
    meta: {
      name,
      icon: <DefaultIcon type={id} className="fill-menu-icon" />,
      desc: "Records the timestamp of an item's last edit. Auto-updated and not editable.",
    },
    default: {
      name,
      icon: <DefaultIcon type={id} />,
      data: null,
      config: { dateFormat: "full", timeFormat: "24-hour", tz },
    },
    fromReadableValue: () => null,
    toReadableValue: (_, row) => row.lastEditedAt.toString(),
    toTextValue: (_, row) =>
      toDateString(
        { start: row.lastEditedAt, includeTime: true },
        { dateFormat: "full", timeFormat: "24-hour", tz },
      ),
    compare: (rowA, rowB) =>
      compareNumbers(rowA.lastEditedAt, rowB.lastEditedAt),
    renderCell: ({ row, config, wrapped, disabled }) => (
      <DateCell
        data={{ start: row.lastEditedAt, includeTime: true }}
        config={config}
        wrapped={wrapped}
        disabled={disabled}
      />
    ),
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
