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
import { Hint, HintProvider } from "@notion-kit/common";
import { IconBlock, IconInfo } from "@notion-kit/icon-block";
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

export interface CustomItemProps {
  className?: string;
  label: string;
  icon?: IconInfo | null;
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
      icon = { type: "lucide", name: "file" },
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
      <HintProvider>
        <div
          ref={ref}
          onClick={onClick}
          role="button"
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          className={cn(
            buttonVariants({ variant: null }),
            "relative flex h-[27px] w-full justify-normal py-1 pr-3 font-medium text-secondary",
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
              icon={icon ?? { type: "text", text: label }}
            />
          </div>
          <span className="ml-1 truncate">{label}</span>
          {!!id && (
            <div className="ml-auto flex items-center p-0.5">
              <DropdownMenu>
                <Hint
                  asChild
                  side="bottom"
                  description="Delete, duplicate, and more..."
                >
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
                            "ml-auto size-auto p-0.5 opacity-0 group-hover:opacity-100",
                        }),
                      )}
                    >
                      <MoreHorizontal className="size-4" />
                    </div>
                  </DropdownMenuTrigger>
                </Hint>
                <DropdownMenuContent
                  className="w-60"
                  align="start"
                  side="right"
                  forceMount
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="warning" onClick={handleDelete}>
                      <Trash className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col items-center px-2 py-1 text-xs text-muted">
                    <div className="w-full">Last edited by: {lastEditedBy}</div>
                    <div className="w-full">{lastEditedAt}</div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              {expandable && (
                <Hint asChild side="bottom" description="Add a page inside">
                  <div
                    role="button"
                    onClick={handleCreate}
                    className={cn(
                      buttonVariants({
                        variant: "hint",
                        className:
                          "ml-auto size-auto rounded-sm p-0.5 opacity-0 group-hover:opacity-100",
                      }),
                    )}
                  >
                    <Plus className="size-4" />
                  </div>
                </Hint>
              )}
            </div>
          )}
        </div>
      </HintProvider>
    );
  },
);
