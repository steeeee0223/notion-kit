"use client";

import React, { forwardRef, useRef } from "react";
import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@notion-kit/cn";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { TooltipPreset } from "@notion-kit/shadcn";

import { DefaultIcon } from "./default-icon";
import { PropMenu, useMenuControl } from "./menus";
import { useTableViewCtx } from "./table-contexts";

interface TableHeaderCellProps {
  id: string;
  width: string;
  isResizing?: boolean;
  resizeHandle: {
    /**
     * @prop onMouseDown: resize for desktop
     */
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * @prop onTouchStart: resize for mobile
     */
    onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
    onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  };
}

/**
 * Table Header Cell
 *
 * @requires SortableContext
 */
export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  id,
  width,
  isResizing,
  resizeHandle,
}) => {
  const { properties } = useTableViewCtx();
  const { openPopover } = useMenuControl();

  const property = properties[id]!;

  const cellRef = useRef<HTMLDivElement>(null);
  const openPropMenu = () => {
    const rect = cellRef.current?.getBoundingClientRect();
    openPopover(<PropMenu propId={id} rect={rect} />, {
      x: rect?.x,
      y: rect?.bottom,
      className: "h-full max-h-[70vh] w-[220px]",
    });
  };

  /** DND */
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    width,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 0,
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition, // Warning: it is somehow laggy
  };

  return (
    <div
      className="relative flex cursor-grab flex-row whitespace-nowrap"
      ref={setNodeRef}
      style={style}
    >
      <div className="relative flex">
        <div
          ref={cellRef}
          // key="notion-table-view-header-cell"
          className="flex shrink-0 overflow-hidden p-0 text-sm"
          style={{ width }}
        >
          <TooltipPreset
            description={property.name}
            side="right"
            className="z-[990]"
          >
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "flex h-full w-full animate-bg-in cursor-pointer items-center px-2 select-none hover:bg-default/5",
                isResizing && "bg-transparent",
              )}
              onClick={openPropMenu}
              onKeyDown={openPropMenu}
            >
              <div className="flex min-w-0 flex-auto items-center text-sm/[1.2]">
                <div className="mr-1 grid items-center justify-center">
                  <div className="col-start-1 row-start-1 opacity-100 transition-opacity duration-150">
                    {property.icon ? (
                      <IconBlock
                        icon={property.icon}
                        className="size-4 p-0 opacity-60 dark:opacity-45"
                      />
                    ) : (
                      <DefaultIcon
                        type={property.type}
                        className="fill-default/45"
                      />
                    )}
                  </div>
                  {/* Use this to sort columns */}
                  <DragHandle attributes={attributes} listeners={listeners} />
                </div>
                <div className="truncate">{property.name}</div>
                {property.description && (
                  <div className="inline-flex items-center">
                    <Icon.Info className="mt-px ml-1 block h-full w-3.5 shrink-0 fill-default/35" />
                  </div>
                )}
              </div>
            </div>
          </TooltipPreset>
        </div>
        {/* Resize handle */}
        <div className="absolute right-0 z-10 w-0 grow-0">
          <div
            tabIndex={-1}
            className={cn(
              "-mt-[1px] -ml-[3px] h-[34px] w-[5px] animate-bg-out cursor-col-resize bg-blue/0 hover:bg-blue/80",
              isResizing && "bg-blue/80",
            )}
            {...resizeHandle}
          />
        </div>
      </div>
    </div>
  );
};

interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

const DragHandle: React.FC<DragHandleProps> = ({ attributes, listeners }) => {
  return (
    <div
      className="col-start-1 row-start-1 opacity-0 transition-opacity duration-150"
      {...attributes}
      {...listeners}
    >
      <div className="flex h-6 w-[18px] shrink-0 animate-bg-in items-center justify-center">
        <Icon.DragHandle className="block size-3 shrink-0 fill-[#91918e]" />
      </div>
    </div>
  );
};

interface ActionCellProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

export const ActionCell = forwardRef<HTMLDivElement, ActionCellProps>(
  ({ icon, onClick }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        id="notion-table-view-add-column"
        className="flex w-8 cursor-pointer justify-start opacity-100 transition-opacity duration-200 select-none hover:bg-default/5 focus-visible:outline-none"
        onClick={onClick}
        onKeyDown={onClick}
      >
        <div className="flex h-full w-8 items-center justify-center">
          {icon}
        </div>
      </div>
    );
  },
);

ActionCell.displayName = "ActionCell";
