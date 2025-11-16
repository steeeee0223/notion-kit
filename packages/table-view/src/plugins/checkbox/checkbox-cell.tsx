"use client";

import { Checkbox } from "@notion-kit/shadcn";

import { CellTrigger } from "../../common";
import type { CellProps } from "../types";

export function CheckboxCell({ data, wrapped, onChange }: CellProps<boolean>) {
  return (
    <CellTrigger
      className="py-2.5"
      wrapped={wrapped}
      onPointerDown={() => onChange((v) => !v)}
    >
      <div className="h-4 max-w-full">
        <Checkbox className="rounded-[3px]" checked={data} />
      </div>
    </CellTrigger>
  );
}
