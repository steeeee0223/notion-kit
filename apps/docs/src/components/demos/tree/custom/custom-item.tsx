/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import React, { forwardRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";

import { cn } from "@notion-kit/cn";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@notion-kit/shadcn";

export interface CustomItemProps {
  className?: string;
  label: string;
  icon?: IconData | null;
  lastEditedBy?: string;
  lastEditedAt?: string;
  id?: string;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  level?: number;
  onClick?: () => void;
  onExpand?: () => void;
  onCreate?: () => void;
  onDelete?: (itemId: string) => void;
}

export const CustomItem = forwardRef<HTMLDivElement, CustomItemProps>(
  function Item(
    {
      className,
      id,
      label,
      icon = { type: "lucide", src: "file" },
      active,
      lastEditedBy = "admin",
      lastEditedAt = "now",
      level = 0,
      expandable = false,
      expanded,
      onClick,
      onExpand,
      onCreate,
      onDelete,
    },
    ref,
  ) {
    /** Events */
    const handleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onExpand?.();
    };
    const handleCreate = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onCreate?.();
      if (!expanded) onExpand?.();
    };
    const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (id) onDelete?.(id);
    };

    return (
      <TooltipProvider>
        <div
          ref={ref}
          onClick={onClick}
          role="button"
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          className={cn(
            buttonVariants({ variant: null }),
            "group/item relative flex h-[27px] w-full justify-normal py-1 pr-3 font-medium text-secondary",
            active && "bg-primary/10 text-primary dark:text-primary/80",
            className,
          )}
        >
          <div className="group/icon">
            <Button
              variant="hint"
              className={cn(
                "relative hidden size-5 shrink-0 p-0.5",
                expandable && "group-hover/icon:flex",
              )}
              onClick={handleExpand}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </Button>
            <IconBlock
              className={cn(expandable && "group-hover/icon:hidden")}
              icon={icon ?? { type: "text", src: label }}
            />
          </div>
          <span className="ml-1 truncate">{label}</span>
          {!!id && (
            <div className="ml-auto flex items-center p-0.5">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      asChild
                    >
                      <div
                        role="button"
                        className={cn(
                          buttonVariants({
                            variant: "hint",
                            className:
                              "ml-auto size-auto p-0.5 opacity-0 group-hover/item:opacity-100",
                          }),
                        )}
                      >
                        <MoreHorizontal className="size-4" />
                      </div>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Delete, duplicate, and more...
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  className="w-60"
                  align="start"
                  side="right"
                  forceMount
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="warning"
                      Icon={<Trash className="size-4" />}
                      Body="Delete"
                      onSelect={handleDelete}
                    />
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col items-center px-2 py-1 text-xs text-muted">
                    <div className="w-full">Last edited by: {lastEditedBy}</div>
                    <div className="w-full">{lastEditedAt}</div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              {expandable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      onClick={handleCreate}
                      className={cn(
                        buttonVariants({
                          variant: "hint",
                          className:
                            "ml-auto size-auto rounded-sm p-0.5 opacity-0 group-hover/item:opacity-100",
                        }),
                      )}
                    >
                      <Plus className="size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add a page inside</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  },
);
