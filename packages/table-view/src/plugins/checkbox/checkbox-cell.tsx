import type {
  CellEditorProps,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";
import { Checkbox } from "@notion-kit/ui/primitives";

export function CheckboxCellValue({ data }: CellValueProps<boolean>) {
  return (
    <div className="h-4 max-w-full">
      <Checkbox
        aria-hidden
        className="pointer-events-none rounded-[3px]"
        checked={data}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

export function CheckboxCellEditor({
  data,
  disabled,
  scope,
}: CellEditorProps<boolean>) {
  const selectedValues = scope.kind === "bulk" ? scope.selectedValues : [data];
  const allChecked = selectedValues.every(Boolean);
  const allUnchecked = selectedValues.every((value) => !value);
  const indeterminate = !allChecked && !allUnchecked;

  return (
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
  );
}
