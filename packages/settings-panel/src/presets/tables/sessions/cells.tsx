"use client";

import { Icon } from "@notion-kit/icons";

import type { SessionRow } from "../../../lib";

interface DeviceCellProps {
  device: string;
  type: SessionRow["type"];
  isCurrent?: boolean;
}

export function DeviceCell({ device, type, isCurrent }: DeviceCellProps) {
  return (
    <div className="flex items-center gap-2">
      <DeviceIcon
        type={type}
        className="block size-6 shrink-0 fill-[rgba(81,73,60,0.32)] dark:fill-primary/30"
      />
      <div className="flex flex-col items-start justify-center">
        <div className="truncate text-xs leading-5 font-normal text-primary">
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
