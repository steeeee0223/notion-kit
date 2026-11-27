import { functionalUpdate } from "@tanstack/react-table";

import {
  type MultiSelectPlugin,
  type SelectConfig,
  type SelectPlugin,
} from "@notion-kit/table-hook/plugins";

import { DefaultIcon } from "@/common";
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
import { ReadOnlySelectValue } from "./read-only-value";
import { SelectCell, SelectCellEditor, SelectCellValue } from "./select-cell";
import { SelectConfigMenu } from "./select-config-menu";
import { SelectGroupingValue } from "./select-grouping-value";

export function select(): TableUiPlugin<SelectPlugin> {
  const renderCell = ({
    data,
    onChange,
    ...props
  }: CellRendererProps<string | null, SelectConfig>) => (
    <SelectCell
      cell={props}
      isEmpty={!data}
      renderEditor={(close) => (
        <SelectCellEditor
          {...props}
          onClose={close}
          onSelect={close}
          data={data ? [data] : []}
          onChange={(updater) => {
            onChange(
              (previous) =>
                functionalUpdate(updater, previous ? [previous] : []).at(0) ??
                null,
            );
          }}
        />
      )}
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
    renderReadOnlyValue: (props) => <ReadOnlySelectValue {...props} />,
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
    <SelectCell
      cell={props}
      isEmpty={props.data.length === 0}
      renderEditor={(close) => (
        <SelectCellEditor
          multi
          {...props}
          onClose={close}
          onChange={onChange}
        />
      )}
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
    renderReadOnlyValue: (props) => <ReadOnlySelectValue {...props} />,
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
