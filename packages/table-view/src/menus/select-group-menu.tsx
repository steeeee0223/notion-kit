import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { ColumnInfo } from "@notion-kit/table-hook";
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

import { DefaultIcon, MenuHeader } from "@/common";
import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

export function SelectGroupMenu() {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();

  const selectGroup = (colId: string | null) => {
    table.setGroupingColumn(colId);
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.EditGroupBy,
    });
  };

  return (
    <table.Subscribe
      selector={(state) => ({
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
        grouping: state.grouping,
        tableGlobal: state.tableGlobal,
      })}
    >
      {({ columnOrder, columnsInfo, grouping, tableGlobal }) => {
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
            ? [
                {
                  kind: "none" as const,
                  id: null,
                  name: messages.groupMenu.none,
                },
              ]
            : []),
          ...options,
        ];

        return (
          <>
            <MenuHeader
              title={messages.groupMenu.groupBy}
              onBack={() =>
                table.setTableMenuState({
                  open: true,
                  page:
                    grouping.length > 0 ? TableViewMenuPage.EditGroupBy : null,
                })
              }
            />
            <Autocomplete
              items={groupOptions}
              itemToStringValue={(option) => option.name}
              open
              autoHighlight="always"
              openOnInputClick
            >
              <AutocompleteInput
                placeholder={messages.groupMenu.searchProperty}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <AutocompleteContent variant="inline">
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
                  {messages.groupMenu.noResults}
                </AutocompleteEmpty>
              </AutocompleteContent>
            </Autocomplete>
          </>
        );
      }}
    </table.Subscribe>
  );
}
