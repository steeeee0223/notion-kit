"use client";

import { useId } from "react";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuItem,
  Label,
  MenuItemAction,
  Switch,
} from "@notion-kit/shadcn";

import type { ConfigMenuProps } from "../types";
import type { TitleConfig } from "./types";

export function TitleConfig({
  config,
  onChange,
}: ConfigMenuProps<TitleConfig>) {
  const id = useId();

  return (
    <Label htmlFor={id}>
      <DropdownMenuItem Icon={<Icon.EmojiFace />} Body="Show page icon">
        <MenuItemAction className="flex items-center">
          <Switch
            id={id}
            size="sm"
            checked={config.showIcon}
            onCheckedChange={(showIcon) =>
              onChange((v) => ({ ...v, showIcon }))
            }
          />
        </MenuItemAction>
      </DropdownMenuItem>
    </Label>
  );
}
