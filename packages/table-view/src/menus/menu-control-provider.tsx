"use client";

import React, { useMemo, useRef, useState } from "react";

import { cn } from "@notion-kit/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@notion-kit/shadcn";

import {
  MenuControlContext,
  MenuControlInterface,
} from "./menu-control-context";

type MenuControlProviderProps = React.PropsWithChildren;

export const MenuControlProvider: React.FC<MenuControlProviderProps> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [popover, setPopover] = useState<React.ReactNode>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const contextValue = useMemo<MenuControlInterface>(
    () => ({
      openPopover: (popover, { x, y, className }) => {
        if (!popover) return false;
        setPopover(
          <PopoverContent
            container={containerRef.current}
            className={cn("z-[990] flex w-[290px] flex-col", className)}
            align="start"
            alignOffset={0}
            side="bottom"
            sideOffset={0}
            collisionPadding={12}
            forceMount
          >
            {popover}
          </PopoverContent>,
        );
        setPosition({ x: x ?? 0, y: y ?? 0 });
        setOpen(true);
      },
      closePopover: () => {
        setPopover(null);
        setOpen(false);
      },
    }),
    [],
  );

  return (
    <MenuControlContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative">
        {children}
        <Popover modal open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className="absolute size-0"
            style={getTriggerPosition(containerRef, position)}
          />
          {popover}
        </Popover>
      </div>
    </MenuControlContext.Provider>
  );
};

const getTriggerPosition = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  position: { x: number; y: number },
) => {
  const rect = containerRef.current?.getBoundingClientRect();
  const style: React.CSSProperties = {};
  if (position.x >= 0) {
    style.left = position.x - (rect?.x ?? 0);
  } else {
    style.right = -position.x;
  }
  if (position.y >= 0) {
    style.top = position.y - (rect?.y ?? 0);
  } else {
    style.bottom = -position.y;
  }
  return style;
};
