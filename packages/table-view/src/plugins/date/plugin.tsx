import { DefaultIcon } from "../../common";
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
      config: {
        dateFormat: "full",
        timeFormat: "12-hour",
        // TODO
        tz: "GMT",
      },
    },
    fromReadableValue: () => ({}),
    toReadableValue: (data) => {
      if (data.start === undefined) return "";
      return data.start.toString();
    },
    toTextValue: (data) =>
      toDateString(data, {
        dateFormat: "full",
        timeFormat: "12-hour",
        tz: "GMT",
      }),
    renderCell: (props) => <DatePickerCell {...props} />,
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}

export function createdTime(): CreatedTimePlugin {
  const id = "created-time";
  const name = "Created Time";
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
      config: {
        dateFormat: "full",
        timeFormat: "12-hour",
        // TODO
        tz: "GMT",
      },
    },
    fromReadableValue: () => null,
    toReadableValue: (data) => (data === null ? "" : data.toString()),
    toTextValue: (data) =>
      toDateString(
        { start: data ?? undefined },
        {
          dateFormat: "full",
          timeFormat: "12-hour",
          tz: "GMT",
        },
      ),
    renderCell: ({ row, config, wrapped }) => (
      <DateCell
        data={{ start: row.createdAt }}
        config={config}
        wrapped={wrapped}
      />
    ),
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}

export function lastEditedTime(): LastEditedTimePlugin {
  const id = "last-edited-time";
  const name = "Last Edited Time";
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
      config: {
        dateFormat: "full",
        timeFormat: "12-hour",
        // TODO
        tz: "GMT",
      },
    },
    fromReadableValue: () => null,
    toReadableValue: (data) => (data === null ? "" : data.toString()),
    toTextValue: (data) =>
      toDateString(
        { start: data ?? undefined },
        {
          dateFormat: "full",
          timeFormat: "12-hour",
          tz: "GMT",
        },
      ),
    renderCell: ({ row, config, wrapped }) => (
      <DateCell
        data={{ start: row.lastEditedAt }}
        config={config}
        wrapped={wrapped}
      />
    ),
    renderConfigMenu: (props) => <DateConfigMenu {...props} />,
    reducer: (v) => v,
  };
}
