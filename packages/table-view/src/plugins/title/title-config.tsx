"use client";

import { Icon } from "@notion-kit/icons";
import { DropdownMenuItem, MenuItemAction, Switch } from "@notion-kit/shadcn";

import { useTableActions } from "../../table-contexts";
import type { ConfigMenuProps } from "../types";
import type { TitleConfig } from "./types";

export function TitleConfig({ propId, config }: ConfigMenuProps<TitleConfig>) {
  const { dispatch } = useTableActions();
  const toggleIconVisibility = () =>
    dispatch({
      type: "update:col:meta:title",
      payload: { id: propId, updater: (prev) => !prev },
    });

  return (
    <DropdownMenuItem
      onSelect={toggleIconVisibility}
      Icon={<Icon.EmojiFace />}
      Body="Show page icon"
    >
      <MenuItemAction className="flex items-center">
        <Switch size="sm" checked={config?.showIcon ?? true} />
      </MenuItemAction>
    </DropdownMenuItem>
  );
}
