"use client";

import { Checkbox } from "@notion-kit/shadcn";

import { CellTrigger } from "../../common";

interface CheckboxCellProps {
  checked: boolean;
  wrapped?: boolean;
  onChange?: (check: boolean) => void;
}

export function CheckboxCell({
  checked,
  wrapped,
  onChange,
}: CheckboxCellProps) {
  return (
    <CellTrigger
      className="py-2.5"
      wrapped={wrapped}
      onPointerDown={() => onChange?.(!checked)}
    >
      <div className="h-4 max-w-full">
        <Checkbox className="rounded-[3px]" checked={checked} />
      </div>
    </CellTrigger>
  );
}
