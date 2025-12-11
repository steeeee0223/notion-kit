"use client";

import { useFilter } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  MenuItem,
  MenuItemCheck,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader } from "../common";
import { TableViewMenuPage } from "../features";
import type { ColumnInfo } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

export function SelectGroupMenu() {
  const { table } = useTableViewCtx();
  const { columnOrder, columnsInfo, grouping, tableGlobal } = table.getState();
  const groupingColId = grouping.at(0);

  const options = columnOrder.reduce<ColumnInfo[]>((acc, colId) => {
    const col = columnsInfo[colId]!;
    if (col.hidden || col.isDeleted) return acc;
    acc.push(col);
    return acc;
  }, []);

  const { search, results, updateSearch } = useFilter(
    options,
    (col, v) => col.name.toLowerCase().includes(v) || "none".includes(v),
  );

  const selectGroup = (colId: string | null) => {
    table.setGroupingColumn(colId);
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.EditGroupBy,
    });
  };

  return (
    <>
      <MenuHeader
        title="Group by"
        onBack={() =>
          table.setTableMenuState({
            open: true,
            page: grouping.length > 0 ? TableViewMenuPage.EditGroupBy : null,
          })
        }
      />
      <Command shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={updateSearch}
          placeholder="Search for a property"
        />
        <CommandList>
          <CommandGroup className="h-40 overflow-y-auto">
            {tableGlobal.layout !== "board" && (
              <CommandItem value="none" asChild>
                <MenuItem Body="None" onClick={() => selectGroup(null)}>
                  {groupingColId === undefined && <MenuItemCheck />}
                </MenuItem>
              </CommandItem>
            )}
            {results?.map(({ id, name, type, icon }) => (
              <CommandItem
                key={id}
                value={name}
                onSelect={() => selectGroup(id)}
                asChild
              >
                <MenuItem
                  key={id}
                  Icon={
                    icon ? (
                      <IconBlock icon={icon} />
                    ) : (
                      <DefaultIcon type={type} />
                    )
                  }
                  Body={name}
                >
                  {groupingColId === id && <MenuItemCheck />}
                </MenuItem>
              </CommandItem>
            )) ?? <span className="px-3 text-xs text-muted">No results</span>}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );
}
