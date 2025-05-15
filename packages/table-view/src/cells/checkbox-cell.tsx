"use client";

import React from "react";

import "../view.css";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

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
      <div className="max-w-full">
        <div
          key="pseudoHover pseudoActive"
          className={cn(
            "--pseudoHover--background: rgba(55,53,47,.06); --pseudoActive--background: rgba(55,53,47,.16); relative flex size-4 shrink-0 grow-0 animate-bg-out items-center justify-center rounded-[3px]",
            checked && "bg-blue",
          )}
        >
          <div aria-hidden="true">
            {checked ? (
              <Icon.RoundedCheck className="block size-3.5 shrink-0 fill-white" />
            ) : (
              <Icon.RoundedSquareCheckbox className="block size-full shrink-0 fill-none stroke-[#C4C4C4]" />
            )}
          </div>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onChange?.(e.target.checked);
            }}
            className="absolute top-0 left-0 size-4 cursor-pointer opacity-0"
          />
        </div>
      </div>
    </CellTrigger>
  );
};
