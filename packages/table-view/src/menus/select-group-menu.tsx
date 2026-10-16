import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { ColumnInfo } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  DropdownMenuEmpty,
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  MenuItemCheck,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

export function SelectGroupMenu() {
  const { table } = useTableViewCtx();

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
            ? [{ kind: "none" as const, id: null, name: "None" }]
            : []),
          ...options,
        ];

        return (
          <>
            <MenuHeader
              title="Group by"
              onBack={() =>
                table.setTableMenuState({
                  open: true,
                  page:
                    grouping.length > 0 ? TableViewMenuPage.EditGroupBy : null,
                })
              }
            />
            <DropdownMenuInput
              placeholder="Search for a property"
              aria-label="Search grouping properties"
            />

            <DropdownMenuList className="has-[[role=menuitem]]:h-40">
              <DropdownMenuGroup>
                {groupOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id ?? "none"}
                    closeOnClick={false}
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
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuList>
            <DropdownMenuEmpty className="px-3 text-start text-muted">
              No results
            </DropdownMenuEmpty>
          </>
        );
      }}
    </table.Subscribe>
  );
}
