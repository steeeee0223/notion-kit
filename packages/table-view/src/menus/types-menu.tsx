"use client";

import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader } from "../common";
import { TableViewMenuPage } from "../features";
import type { PluginType } from "../lib/types";
import { CellPlugin } from "../plugins";
import { useTableViewCtx } from "../table-contexts";
import { propOptions } from "./types-menu-options";

interface TypesMenuProps {
  /**
   * @prop {propId}: if null, will create a new column;
   * otherwise will update a column by given `propId`
   */
  propId?: string;
  /**
   * @prop {at}: if undefined, will create a new column at the end;
   * otherwise will create a column at `at.side` of the column `at.id`
   */
  at?: {
    id: string;
    side: "left" | "right";
  };
  /**
   * @prop {menu}: control the menu page
   */
  menu: TableViewMenuPage.CreateProp | TableViewMenuPage.ChangePropType | null;
  /**
   * @prop {back}: whether to show back button in the header
   */
  back?: boolean;
}

export function TypesMenu({ propId, at, menu, back }: TypesMenuProps) {
  const { table } = useTableViewCtx();

  const plugins = table.getState().cellPlugins;
  const propType = propId ? table.getColumnInfo(propId).type : null;

  const typeOptions = propOptions.filter((option) => option.type in plugins);
  const { search, results, updateSearch } = useFilter(typeOptions, (prop, v) =>
    prop.title.toLowerCase().includes(v),
  );
  const select = (type: PluginType<CellPlugin[]>, name: string) => {
    let colId = propId;
    if (colId === undefined) {
      colId = v4();
      const uniqueName = table.generateUniqueColumnName(name);
      table.addColumnInfo({ id: colId, type, name: uniqueName, at });
    } else {
      table.setColumnType(colId, type);
    }
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.EditProp,
      id: colId,
    });
  };

  return (
    <>
      {menu && (
        <MenuHeader
          title={
            menu === TableViewMenuPage.ChangePropType
              ? "Change property type"
              : "New property"
          }
          onBack={
            back
              ? () =>
                  table.setTableMenuState({
                    open: true,
                    page:
                      menu === TableViewMenuPage.ChangePropType
                        ? TableViewMenuPage.EditProp
                        : TableViewMenuPage.Props,
                    id: propId,
                  })
              : undefined
          }
        />
      )}
      <Command shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={updateSearch}
          placeholder={
            propId ? "Search for property type" : "Search or add new property"
          }
        />
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
                value={`search-${search}`}
                onSelect={() => select("text", search)}
                asChild
              >
                <MenuItem
                  Icon={<DefaultIcon type="text" className="fill-menu-icon" />}
                  Body={search}
                />
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </>
  );
}
