"use client";

import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
  MenuItem,
  MenuItemCheck,
  TooltipPreset,
  useMenu,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader } from "../common";
import type { PluginType } from "../lib/types";
import { getUniqueName } from "../lib/utils";
import { CellPlugin } from "../plugins";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { EditPropMenu } from "./edit-prop-menu";
import { propOptions } from "./types-menu-options";

interface TypesMenuProps {
  /**
   * @prop {propId}: if null, will create a new column;
   * otherwise will update a column by given `propId`
   */
  propId: string | null;
  /**
   * @prop {at}: if undefined, will create a new column at the end;
   * otherwise will create a column at `at.side` of the column `at.id`
   */
  at?: {
    id: string;
    side: "left" | "right";
  };
  showHeader?: boolean;
}

export function TypesMenu({ propId, at, showHeader = true }: TypesMenuProps) {
  const { table, properties } = useTableViewCtx();
  const { addColumn } = useTableActions();
  const { openMenu } = useMenu();

  const propType = propId ? table.getColumnInfo(propId).type : null;

  const { search, results, updateSearch } = useFilter(propOptions, (prop, v) =>
    prop.title.toLowerCase().includes(v),
  );
  const select = (type: PluginType<CellPlugin[]>, name: string) => {
    let colId = propId;
    if (colId === null) {
      colId = v4();
      const uniqueName = getUniqueName(
        name,
        Object.values(properties).map((p) => p.name),
      );
      addColumn({ id: colId, type, name: uniqueName, at });
    } else {
      table.setColumnType(colId, type);
    }

    openMenu(<EditPropMenu propId={colId} />, { x: -12, y: -12 });
  };

  return (
    <>
      {showHeader && (
        <MenuHeader title={propId ? "Change property type" : "New property"} />
      )}
      <Command className="bg-popover">
        <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
          <Input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder={
              propId ? "Search for property type" : "Search or add new property"
            }
          />
        </div>
        <CommandList>
          {results && results.length > 0 && (
            <CommandGroup
              className={cn(
                "flex flex-col gap-px px-0",
                "[&_[cmdk-group-heading]]:mt-1.5 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:truncate [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-0 [&_[cmdk-group-heading]]:leading-[1.2] [&_[cmdk-group-heading]]:text-secondary [&_[cmdk-group-heading]]:select-none",
              )}
              heading="Type"
            >
              {results.map(({ type, title, description, icon }) => (
                <CommandItem key={type} value={`default-${type}`} asChild>
                  <TooltipPreset
                    side="left"
                    sideOffset={6}
                    description={description}
                    // WARNING adding `text-xs/[1.4] to prevent style overriding by `CommandItem`
                    className="max-w-[282px] text-xs/[1.4]"
                  >
                    <MenuItem
                      disabled={type === "title"}
                      Icon={icon}
                      Body={title}
                      onClick={() => select(type, title)}
                    >
                      {propType === type && <MenuItemCheck />}
                    </MenuItem>
                  </TooltipPreset>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!propId && search.length > 0 && (
            <CommandGroup
              className={cn(
                "flex flex-col gap-px px-0",
                "[&_[cmdk-group-heading]]:mt-1.5 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:flex [&_[cmdk-group-heading]]:items-center [&_[cmdk-group-heading]]:truncate [&_[cmdk-group-heading]]:px-3.5 [&_[cmdk-group-heading]]:py-0 [&_[cmdk-group-heading]]:leading-[1.2] [&_[cmdk-group-heading]]:text-secondary [&_[cmdk-group-heading]]:select-none",
              )}
              heading="Select to add"
            >
              <CommandItem
                className="mx-1 gap-2"
                value={`search-${search}`}
                onSelect={() => select("text", search)}
              >
                <DefaultIcon type="text" className="fill-menu-icon" />
                {search}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </>
  );
}
