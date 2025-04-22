"use client";

import { MoreHorizontal, Trash } from "lucide-react";

import type { Page } from "@notion-kit/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

import { NavbarItem } from "../core";
import type { StateChangeEvent } from "./types";

interface MenuProps {
  page: Page;
  onChangeState?: StateChangeEvent;
}

export const Menu: React.FC<MenuProps> = ({ page, onChangeState }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavbarItem hint="Style, export, and more...">
          <MoreHorizontal className="size-4" />
        </NavbarItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="warning"
            Icon={<Trash className="size-4" />}
            Body="Delete"
            onSelect={() => onChangeState?.(page.id, "archive")}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex flex-col items-center p-2 text-xs text-muted">
          <div className="w-full">Last edited by: {page.lastEditedBy}</div>
          <div className="w-full">{toDateString(page.lastEditedAt)}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
