import { z } from "zod";

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

const snapshotSchema = z.object({ value: z.boolean(), config: z.undefined() });

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
    renderReadOnlyValue: ({ value, config, property, textValue }) => {
      const parsed = snapshotSchema.safeParse({ value, config });
      if (!parsed.success) return textValue;
      return (
        <div
          role="checkbox"
          aria-label={property.name}
          aria-checked={parsed.data.value}
          aria-readonly="true"
        >
          <CheckboxCellValue data={parsed.data.value} />
        </div>
      );
    },
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
