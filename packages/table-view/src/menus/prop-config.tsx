"use client";

import { Icon } from "@notion-kit/icons";
import { DropdownMenuItem, MenuItemAction, Switch } from "@notion-kit/shadcn";

import type { PropertyConfig } from "../lib/types";
import { SelectConfigMenu } from "../plugins/select";
import { useTableActions } from "../table-contexts";

interface PropConfigProps {
  propId: string;
  meta: PropertyConfig;
}

export function PropConfig({ propId, meta }: PropConfigProps) {
  const { dispatch } = useTableActions();

  switch (meta.type) {
    case "title": {
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
            <Switch size="sm" checked={meta.config.showIcon} />
          </MenuItemAction>
        </DropdownMenuItem>
      );
    }
    case "select":
    case "multi-select":
      return <SelectConfigMenu propId={propId} meta={meta} />;
    default:
      return null;
  }
}
