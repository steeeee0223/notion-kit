"use client";

import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  MenuItemCheck,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader } from "../common";
import { TableViewMenuPage } from "../features";
import type { ColumnInfo } from "../lib/types";
import { useTableViewCtx } from "../table-contexts";

export function SelectGroupMenu() {
  const { table } = useTableViewCtx();
  const { columnOrder, columnsInfo, grouping, tableGlobal } = table.getState();
  const groupingColId = grouping.at(0);

  const options = columnOrder.reduce<(ColumnInfo & { kind: "column" })[]>(
    (acc, colId) => {
      const col = columnsInfo[colId]!;
      if (col.hidden || col.isDeleted) return acc;
      acc.push({ ...col, kind: "column" });
      return acc;
    },
    [],
  );
  const groupOptions = [
    ...(tableGlobal.layout !== "board"
      ? [{ kind: "none" as const, id: null, name: "None" }]
      : []),
    ...options,
  ];

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
      <div
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Autocomplete
          items={groupOptions}
          itemToStringValue={(option) => option.name}
          open
          autoHighlight="always"
          openOnInputClick
        >
          <AutocompleteInput placeholder="Search for a property" />
          <AutocompleteContent role="presentation" variant="inline">
            <AutocompleteList>
              <AutocompleteGroup className="h-40">
                <AutocompleteCollection>
                  {(option: (typeof groupOptions)[number]) => (
                    <AutocompleteItem
                      key={option.id ?? "none"}
                      value={option}
                      label={option.name}
                      icon={
                        option.kind === "column" ? (
                          option.icon ? (
                            <IconBlock icon={option.icon} />
                          ) : (
                            <DefaultIcon type={option.type} />
                          )
                        ) : null
                      }
                      onClick={() => selectGroup(option.id)}
                    >
                      {groupingColId === (option.id ?? undefined) && (
                        <MenuItemCheck />
                      )}
                    </AutocompleteItem>
                  )}
                </AutocompleteCollection>
              </AutocompleteGroup>
            </AutocompleteList>
            <AutocompleteEmpty className="px-3 text-start text-muted">
              No results
            </AutocompleteEmpty>
          </AutocompleteContent>
        </Autocomplete>
      </div>
    </>
  );
}
