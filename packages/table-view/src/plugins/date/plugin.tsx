import type React from "react";

import {
  type CreatedTimePlugin,
  type DateData,
  type DatePlugin,
  type LastEditedTimePlugin,
} from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  getCellTriggerClass,
  getCompactWidthClass,
  getCopyClasses,
} from "../utils";
import { DateCell, DatePickerCellValue, DateTimePicker } from "./date-cell";
import { DateConfigMenu } from "./date-config-menu";
import { DateGroupingValue } from "./date-grouping-value";

const dateRenderers = {
  renderConfigMenu: DateConfigMenu,
  renderGroupingValue: DateGroupingValue,
};

export function date(): TableUiPlugin<DatePlugin> {
  const renderCell = (
    props: Parameters<TableUiPlugin<DatePlugin>["renderCell"]>[0],
  ) =>
    renderDateCell(
      props,
      <DatePickerCellValue {...props} />,
      props.data.start === undefined,
      () => (
        <DateTimePicker
          data={props.data}
          config={props.config}
          onChange={props.onChange}
          onConfigChange={props.onConfigChange}
        />
      ),
    );
  return {
    id: "date",
    meta: {
      name: "Date",
      desc: "Accepts a date or a date range (time optional). Useful for deadlines, especially with calendar and timeline views.",
      icon: <DefaultIcon type="date" className="fill-menu-icon" />,
    },
    default: { name: "Date", icon: <DefaultIcon type="date" /> },
    renderCell,
    renderBulkEditor: (props) => (
      <BulkEditorPopover {...props} initialData={props.data}>
        {(data, onChange) => (
          <DateTimePicker
            data={data}
            config={props.config}
            onChange={onChange}
            onConfigChange={props.onConfigChange}
          />
        )}
      </BulkEditorPopover>
    ),
    ...dateRenderers,
  };
}

export function createdTime(): TableUiPlugin<CreatedTimePlugin> {
  const renderCell = ({
    row,
    data: _data,
    ...props
  }: Parameters<TableUiPlugin<CreatedTimePlugin>["renderCell"]>[0]) =>
    renderDateCell(
      { ...props, data: { start: row.createdAt, includeTime: true } },
      <DateCell
        data={{ start: row.createdAt, includeTime: true }}
        row={row}
        {...props}
      />,
      false,
    );
  return {
    id: "created-time",
    meta: {
      name: "Created time",
      desc: "Records the timestamp of an item's creation. Auto-generated and not editable.",
      icon: <DefaultIcon type="created-time" className="fill-menu-icon" />,
    },
    default: {
      name: "Created time",
      icon: <DefaultIcon type="created-time" />,
    },
    renderCell,
    ...dateRenderers,
  };
}

export function lastEditedTime(): TableUiPlugin<LastEditedTimePlugin> {
  const renderCell = ({
    row,
    data: _data,
    ...props
  }: Parameters<TableUiPlugin<LastEditedTimePlugin>["renderCell"]>[0]) =>
    renderDateCell(
      { ...props, data: { start: row.lastEditedAt, includeTime: true } },
      <DateCell
        data={{ start: row.lastEditedAt, includeTime: true }}
        row={row}
        {...props}
      />,
      false,
    );
  return {
    id: "last-edited-time",
    meta: {
      name: "Last edited time",
      desc: "Records the timestamp of an item's last edit. Auto-updated and not editable.",
      icon: <DefaultIcon type="last-edited-time" className="fill-menu-icon" />,
    },
    default: {
      name: "Last edited time",
      icon: <DefaultIcon type="last-edited-time" />,
    },
    renderCell,
    ...dateRenderers,
  };
}

function renderDateCell(
  props: {
    data: DateData;
    disabled?: boolean;
    surface: "table" | "list" | "board" | "row-view" | "timeline";
    textValue: string;
    wrapped?: boolean;
  },
  value: React.ReactNode,
  isEmpty: boolean,
  renderEditor?: (close: () => void) => React.ReactNode,
) {
  const copy = getCopyClasses("date");
  return (
    <CellRenderer
      compactClassName={getCompactWidthClass("date")}
      copyButtonClassName={copy.copyHoverClassName}
      copyClassName={copy.copyGroupClassName}
      copyValue={
        props.surface === "table" || props.surface === "row-view"
          ? props.textValue
          : undefined
      }
      disabled={props.disabled}
      emptyContent={
        props.surface === "row-view" && isEmpty ? (
          <div className="leading-normal text-muted">Empty</div>
        ) : undefined
      }
      hideWhenEmpty={props.surface === "list" || props.surface === "board"}
      isEmpty={isEmpty}
      popover={{
        align: "start",
        side: "bottom",
        sideOffset: 0,
        className: "w-62",
      }}
      renderEditor={renderEditor}
      surface={props.surface}
      triggerClassName={getCellTriggerClass({
        kind: "date",
        surface: props.surface,
        wrapped: props.wrapped,
      })}
      value={value}
    />
  );
}
