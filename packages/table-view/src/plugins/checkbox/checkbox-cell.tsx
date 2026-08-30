import { cn } from "@notion-kit/cn";
import type {
  CellEditorProps,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";
import { Checkbox } from "@notion-kit/ui/primitives";

import { CellTrigger } from "@/common";

export function CheckboxCellValue({ data }: CellValueProps<boolean>) {
  return (
    <div className="h-4 max-w-full">
      <Checkbox className="rounded-[3px]" checked={data} />
    </div>
  );
}

export function CheckboxCellEditor({
  data,
  wrapped,
  disabled,
  layout,
  tooltip,
  onChange,
  scope,
}: CellEditorProps<boolean>) {
  const selectedValues = scope.kind === "bulk" ? scope.selectedValues : [data];
  const allChecked = selectedValues.every(Boolean);
  const allUnchecked = selectedValues.every((value) => !value);
  const indeterminate = !allChecked && !allUnchecked;

  return (
    <CellTrigger
      className={cn(layout === "table" && "py-2.5")}
      wrapped={wrapped}
      layout={layout}
      aria-disabled={disabled}
      tooltip={tooltip}
      onClick={() => onChange(!allChecked)}
    >
      <div className="h-4 max-w-full">
        <Checkbox
          aria-hidden
          className="pointer-events-none rounded-[3px]"
          checked={allChecked}
          indeterminate={indeterminate}
          disabled={disabled}
          readOnly
          tabIndex={-1}
        />
      </div>
    </CellTrigger>
  );
}
