import type { CheckboxPlugin } from "@notion-kit/table-hook/plugins";

import { CellRenderer, DefaultIcon } from "@/common";
import { BulkEditorToggle } from "@/common/bulk-edit/bulk-editor";

import type { TableUiPlugin } from "../registry";
import {
  createBulkEditorRenderer,
  createCellRenderer,
  type BulkEditorRendererProps,
  type CellRendererProps,
} from "../renderers";
import { getCellTriggerClass, getCompactWidthClass } from "../utils";
import { CheckboxCellValue } from "./checkbox-cell";
import { CheckboxGroupingValue } from "./checkbox-grouping-value";

export function checkbox(): TableUiPlugin<CheckboxPlugin> {
  const renderCell = (props: CellRendererProps<boolean>) => (
    <CellRenderer
      compactClassName={getCompactWidthClass("checkbox")}
      disabled={props.disabled}
      hideWhenEmpty={false}
      isEmpty={false}
      onClick={() => props.onChange(!props.data)}
      surface={props.surface}
      triggerClassName={getCellTriggerClass({
        kind: "checkbox",
        surface: props.surface,
        wrapped: props.wrapped,
      })}
      value={<CheckboxCellValue {...props} />}
    />
  );
  return {
    id: "checkbox",
    meta: {
      name: "Checkbox",
      desc: "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
      icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
    },
    default: { name: "Checkbox", icon: <DefaultIcon type="checkbox" /> },
    renderCell: createCellRenderer(renderCell),
    renderBulkEditor: createBulkEditorRenderer<CheckboxPlugin>(
      (props: BulkEditorRendererProps<boolean>) => (
        <BulkEditorToggle
          {...props}
          onClick={() => props.onChange(!props.selectedValues.every(Boolean))}
        />
      ),
    ),
    renderGroupingValue: (props) => <CheckboxGroupingValue {...props} />,
  };
}
