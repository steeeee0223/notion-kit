"use client";

import { Icon } from "@notion-kit/icons";
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

export function Menu({ page, onChangeState }: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavbarItem hint="Style, export, and more...">
          <Icon.Dots className="size-4 fill-current" />
        </NavbarItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" alignOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="warning"
            Icon={<Icon.Trash />}
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
}
