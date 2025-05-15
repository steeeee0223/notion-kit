import React, { forwardRef } from "react";

import "../view.css";

import { cn } from "@notion-kit/cn";

interface CellTriggerProps extends React.PropsWithChildren {
  className?: string;
  wrapped?: boolean;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
}

export const CellTrigger = forwardRef<HTMLDivElement, CellTriggerProps>(
  ({ className, wrapped, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          "relative block min-h-8 w-full animate-bg-in cursor-pointer overflow-clip px-2 py-[5px] text-sm select-none",
          wrapped ? "whitespace-normal" : "whitespace-nowrap",
          className,
        )}
        {...props}
      />
    );
  },
);

CellTrigger.displayName = "CellTrigger";
