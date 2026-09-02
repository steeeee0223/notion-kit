import {
  type CreatedTimePlugin,
  type DatePlugin,
  type LastEditedTimePlugin,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";

import { DateCell, DatePickerCellValue, DateTimePicker } from "./date-cell";
import { DateConfigMenu } from "./date-config-menu";
import { DateGroupingValue } from "./date-grouping-value";
import type { TableUiPlugin } from "../registry";

const dateRenderers = {
  renderConfigMenu: DateConfigMenu,
  renderGroupingValue: DateGroupingValue,
};

export function date(): TableUiPlugin<DatePlugin> {
  const renderCell = (props: Parameters<TableUiPlugin<DatePlugin>["renderCell"]>[0]) => (
    <DatePickerCellValue {...props} />
  );
  return {
    id: "date",
    meta: { name: "Date", desc: "Accepts a date or a date range (time optional). Useful for deadlines, especially with calendar and timeline views.", icon: <DefaultIcon type="date" className="fill-menu-icon" /> },
    default: { name: "Date", icon: <DefaultIcon type="date" /> },
    renderCell,
    renderCellValue: renderCell,
    renderCellEditor: (props) => ({
      presentation: "popover",
      closeOnChange: false,
      content: (
        <DateTimePicker
          data={props.data}
          config={props.config}
          onChange={props.onChange}
          onConfigChange={props.onConfigChange}
        />
      ),
      popover: {
        align: "start",
        side: "bottom",
        sideOffset: 0,
        className: "w-62",
      },
    }),
    ...dateRenderers,
  };
}

export function createdTime(): TableUiPlugin<CreatedTimePlugin> {
  const renderCell = ({ row, data: _data, ...props }: Parameters<TableUiPlugin<CreatedTimePlugin>["renderCell"]>[0]) => (
    <DateCell data={{ start: row.createdAt, includeTime: true }} row={row} {...props} />
  );
  return {
    id: "created-time",
    meta: { name: "Created time", desc: "Records the timestamp of an item's creation. Auto-generated and not editable.", icon: <DefaultIcon type="created-time" className="fill-menu-icon" /> },
    default: { name: "Created time", icon: <DefaultIcon type="created-time" /> },
    renderCell,
    renderCellValue: renderCell,
    ...dateRenderers,
  };
}

export function lastEditedTime(): TableUiPlugin<LastEditedTimePlugin> {
  const renderCell = ({ row, data: _data, ...props }: Parameters<TableUiPlugin<LastEditedTimePlugin>["renderCell"]>[0]) => (
    <DateCell data={{ start: row.lastEditedAt, includeTime: true }} row={row} {...props} />
  );
  return {
    id: "last-edited-time",
    meta: { name: "Last edited time", desc: "Records the timestamp of an item's last edit. Auto-updated and not editable.", icon: <DefaultIcon type="last-edited-time" className="fill-menu-icon" /> },
    default: { name: "Last edited time", icon: <DefaultIcon type="last-edited-time" /> },
    renderCell,
    renderCellValue: renderCell,
    ...dateRenderers,
  };
}
