"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Button } from "@notion-kit/shadcn";

interface TableHeaderActionCellProps
  extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
}

export function TableHeaderActionCell({
  icon,
  className,
  ...props
}: TableHeaderActionCellProps) {
  return (
    <Button
      tabIndex={0}
      id="notion-table-view-add-column"
      variant="cell"
      className={cn("w-8", className)}
      {...props}
    >
      <div className="flex h-full w-8 items-center justify-center [&_svg]:fill-default/45">
        {icon}
      </div>
    </Button>
  );
}
