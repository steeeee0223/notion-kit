"use client";

import React from "react";

import { Checkbox } from "@notion-kit/shadcn";

import { CellTrigger } from "./cell-trigger";

interface CheckboxCellProps {
  checked: boolean;
  wrapped?: boolean;
  onChange?: (check: boolean) => void;
}

export const CheckboxCell: React.FC<CheckboxCellProps> = ({
  checked,
  wrapped,
  onChange,
}) => {
  return (
    <CellTrigger
      className="py-2"
      wrapped={wrapped}
      onPointerDown={() => onChange?.(!checked)}
    >
      <div className="h-4 max-w-full">
        <Checkbox className="rounded-[3px]" checked={checked} />
      </div>
    </CellTrigger>
  );
};
