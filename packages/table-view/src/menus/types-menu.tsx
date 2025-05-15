"use client";

import React from "react";
import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Input,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { MenuHeader } from "../common";
import { DefaultIcon } from "../default-icon";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import type { PropertyType } from "../types";
import { getUniqueName } from "../utils";
import { EditPropMenu } from "./edit-prop-menu";
import { useMenuControl } from "./menu-control-context";
import { propOptions } from "./types-menu-options";

interface TypesMenuProps {
  /**
   * @prop {propId}: if null, will create a new column;
   * otherwise will update a column by given `propId`
   */
  propId: string | null;
}

export const TypesMenu: React.FC<TypesMenuProps> = ({ propId }) => {
  const { properties } = useTableViewCtx();
  const { addColumn, updateColumnType } = useTableActions();
  const { openPopover } = useMenuControl();

  const property = propId ? properties[propId]! : null;

  const { search, results, updateSearch } = useFilter(propOptions, (prop, v) =>
    prop.title.toLowerCase().includes(v),
  );
  const select = (type: PropertyType, name: string) => {
    let colId = propId;
    if (colId === null) {
      colId = v4();
      const uniqueName = getUniqueName(
        name,
        Object.values(properties).map((p) => p.name),
      );
      addColumn({ id: colId, type, name: uniqueName });
    } else {
      updateColumnType(colId, type);
    }

    openPopover(<EditPropMenu propId={colId} />, { x: -12, y: -12 });
  };

  return (
    <>
      <MenuHeader title={propId ? "Change property type" : "New property"} />
      <Command>
        <div className="flex min-w-0 flex-auto flex-col px-3 pt-3 pb-2">
          <Input
            className="px-1.5 py-[3px] text-sm"
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
                <TooltipPreset
                  side="left"
                  sideOffset={6}
                  description={description}
                  className="max-w-[282px]"
                  key={type as string}
                >
                  <CommandItem
                    className="mx-1 gap-2"
                    value={`default-${type}`}
                    onSelect={() => select(type, title)}
                    disabled={type === "title"}
                  >
                    {icon}
                    {title}
                    {property?.type === type && (
                      <div className="mr-1 ml-auto w-3.5 min-w-0 shrink-0">
                        <svg
                          aria-hidden="true"
                          role="graphics-symbol"
                          viewBox="0 0 16 16"
                          className="block size-full shrink-0 fill-inherit"
                        >
                          <path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4-3.042-3.903c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z" />
                        </svg>
                      </div>
                    )}
                  </CommandItem>
                </TooltipPreset>
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
                <DefaultIcon type="text" className="fill-icon" />
                {search}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </>
  );
};
