"use client";

import type { SortDirection } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/shadcn";

import { SessionRow } from "../../lib";

interface HeaderProps {
  title: string;
  className?: string;
}

/**
 * @see people (same component)
 */
export function Header({ title, className }: HeaderProps) {
  return (
    <div
      className={cn("truncate text-xs font-normal text-secondary", className)}
    >
      {title}
    </div>
  );
}

interface SortingToggleProps {
  title: string;
  isSorted: false | SortDirection;
  toggle: () => void;
}

/**
 * @see people (extended version)
 */
export function SortingToggle({ title, isSorted, toggle }: SortingToggleProps) {
  return (
    <Button variant="hint" size="xs" onClick={toggle} className="px-1">
      <Header title={title} />
      {isSorted &&
        (isSorted === "asc" ? (
          <Icon.ArrowUp className="ml-1 size-3 flex-shrink-0 fill-secondary" />
        ) : (
          <Icon.ArrowDown className="ml-1 size-3 flex-shrink-0 fill-secondary" />
        ))}
    </Button>
  );
}

interface DeviceCellProps {
  device: string;
  type: SessionRow["type"];
  isCurrent?: boolean;
}

export function DeviceCell({ device, type, isCurrent }: DeviceCellProps) {
  return (
    <div className="ml-1 flex items-center gap-2">
      <DeviceIcon
        type={type}
        className="block size-6 shrink-0 fill-[rgba(81,73,60,0.32)]"
      />
      <div className="flex flex-col items-start justify-center">
        <div
          key="notranslate"
          className="truncate text-xs leading-5 font-normal text-primary"
        >
          {device}
        </div>
        {isCurrent && (
          <p className="m-0 text-[11px] font-normal text-blue">This Device</p>
        )}
      </div>
    </div>
  );
}

interface DeviceIconProps {
  type: SessionRow["type"];
  className?: string;
}

function DeviceIcon({ type, className }: DeviceIconProps) {
  switch (type) {
    case "mobile":
      return <Icon.CellPhone className={className} />;
    default:
      return <Icon.Laptop className={className} />;
  }
}

interface TextCellProps {
  value: string;
}

export function TextCell({ value }: TextCellProps) {
  return <div className="truncate text-xs text-secondary">{value}</div>;
}
