import { Checkbox } from "@notion-kit/ui/primitives";

import type { CellValueProps } from "@/plugins/renderers";

export function CheckboxCellValue({
  data,
}: Pick<CellValueProps<boolean>, "data">) {
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
