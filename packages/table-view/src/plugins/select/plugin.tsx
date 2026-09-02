import { functionalUpdate } from "@tanstack/react-table";

import {
  type MultiSelectPlugin,
  type SelectConfig,
  type SelectPlugin,
} from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorPopover } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  createConfigMenuRenderer,
  type BulkEditorRendererProps,
  type CellRendererProps,
  type ConfigMenuRendererProps,
} from "../renderers";
import { getCellTriggerClass, getCompactWidthClass } from "../utils";
import { SelectCellEditor, SelectCellValue } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";

export function select(): TableUiPlugin<SelectPlugin> {
  const renderCell = ({
    data,
    onChange,
    ...props
  }: CellRendererProps<string | null, SelectConfig>) => (
    <CellRenderer
      compactClassName={getCompactWidthClass("select")}
      disabled={props.disabled}
      emptyContent={
        props.surface === "row-view" && !data ? (
          <div className="flex items-center justify-between">
            <div
              className={
                props.wrapped
                  ? "flex flex-wrap gap-x-2 gap-y-1.5 text-muted"
                  : "flex flex-nowrap gap-x-2 gap-y-1.5 text-muted"
              }
            >
              Empty
            </div>
          </div>
        ) : undefined
      }
      hideWhenEmpty={props.surface === "list" || props.surface === "board"}
      isEmpty={!data}
      popover={{
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      }}
      renderEditor={(close) => (
        <SelectCellEditor
          {...props}
          data={data ? [data] : []}
          onChange={(updater) => {
            onChange(
              (previous) =>
                functionalUpdate(updater, previous ? [previous] : []).at(0) ??
                null,
            );
            close();
          }}
        />
      )}
      surface={props.surface}
      triggerClassName={getCellTriggerClass({
        kind: "select",
        surface: props.surface,
        wrapped: props.wrapped,
      })}
      value={<SelectCellValue data={data ? [data] : []} {...props} />}
    />
  );
  return {
    id: "select",
    meta: {
      name: "Select",
      desc: "Use a select property to choose one option from a predefined list. Great for categorization.",
      icon: <DefaultIcon type="select" className="fill-menu-icon" />,
    },
    default: { name: "Select", icon: <DefaultIcon type="select" /> },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<SelectPlugin>(
      (props: BulkEditorRendererProps<string | null, SelectConfig>) => (
        <BulkEditorPopover {...props} initialData={props.data}>
          {(data, onChange) => (
            <SelectCellEditor
              data={data ? [data] : []}
              config={props.config}
              propId={props.propId}
              onConfigChange={props.onConfigChange}
              onChange={(updater) =>
                onChange(
                  (previous) =>
                    functionalUpdate(updater, previous ? [previous] : []).at(
                      0,
                    ) ?? null,
                )
              }
            />
          )}
        </BulkEditorPopover>
      ),
    ),
    renderConfigMenu: createConfigMenuRenderer<SelectPlugin>(
      (props: ConfigMenuRendererProps<SelectConfig>) => (
        <SelectConfigMenu {...props} />
      ),
    ),
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}

export function multiSelect(): TableUiPlugin<MultiSelectPlugin> {
  const renderCell = ({
    onChange,
    ...props
  }: CellRendererProps<string[], SelectConfig>) => (
    <CellRenderer
      compactClassName={getCompactWidthClass("select")}
      disabled={props.disabled}
      emptyContent={
        props.surface === "row-view" && props.data.length === 0 ? (
          <div className="flex items-center justify-between">
            <div
              className={
                props.wrapped
                  ? "flex flex-wrap gap-x-2 gap-y-1.5 text-muted"
                  : "flex flex-nowrap gap-x-2 gap-y-1.5 text-muted"
              }
            >
              Empty
            </div>
          </div>
        ) : undefined
      }
      hideWhenEmpty={props.surface === "list" || props.surface === "board"}
      isEmpty={props.data.length === 0}
      popover={{
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      }}
      renderEditor={(close) => (
        <SelectCellEditor
          multi
          {...props}
          onChange={(updater) => {
            onChange(updater);
            close();
          }}
        />
      )}
      surface={props.surface}
      triggerClassName={getCellTriggerClass({
        kind: "select",
        surface: props.surface,
        wrapped: props.wrapped,
      })}
      value={<SelectCellValue multi {...props} />}
    />
  );
  return {
    id: "multi-select",
    meta: {
      name: "Multi-Select",
      desc: "Use a multi-select property to choose multiple options from a predefined list. Useful for tagging or categorization.",
      icon: <DefaultIcon type="multi-select" className="fill-menu-icon" />,
    },
    default: {
      name: "Multi-Select",
      icon: <DefaultIcon type="multi-select" />,
    },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<MultiSelectPlugin>(
      (props: BulkEditorRendererProps<string[], SelectConfig>) => (
        <BulkEditorPopover {...props} initialData={props.data}>
          {(data, onChange) => (
            <SelectCellEditor
              multi
              data={data}
              config={props.config}
              propId={props.propId}
              onConfigChange={props.onConfigChange}
              onChange={onChange}
            />
          )}
        </BulkEditorPopover>
      ),
    ),
    renderConfigMenu: createConfigMenuRenderer<MultiSelectPlugin>(
      (props: ConfigMenuRendererProps<SelectConfig>) => (
        <SelectConfigMenu {...props} />
      ),
    ),
    renderGroupingValue: (props) => <SelectGroupingValue {...props} />,
  };
}
