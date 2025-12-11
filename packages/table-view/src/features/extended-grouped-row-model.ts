import type { Row, RowData, RowModel, Table } from "@tanstack/react-table";
import {
  createRow,
  flattenBy,
  getMemoOptions,
  memo,
} from "@tanstack/react-table";

import type { ComparableValue } from "../plugins";
import { createGroupId } from "./utils";

export function getExtendedGroupedRowModel<TData extends RowData>(): (
  table: Table<TData>,
) => () => RowModel<TData> {
  return (table) =>
    memo(
      () => [
        table.getState().grouping,
        table.getPreGroupedRowModel(),
        table.getState().groupingState.groupOrder,
        table.getState().groupingState.groupVisibility,
        table.getState().groupingState.hideEmptyGroups,
      ],
      (grouping, rowModel, groupOrder, groupVisibility, hideEmptyGroups) => {
        if (!rowModel.rows.length || !grouping.length) {
          rowModel.rows.forEach((row) => {
            row.depth = 0;
            row.parentId = undefined;
          });
          return rowModel;
        }

        // Filter the grouping list down to columns that exist
        const existingGrouping = grouping.filter((columnId) =>
          table.getColumn(columnId),
        );

        const groupedFlatRows: Row<TData>[] = [];
        const groupedRowsById: Record<string, Row<TData>> = {};

        // Recursively group the data with integrated visibility filtering
        const groupUpRecursively = (
          rows: Row<TData>[],
          depth = 0,
          parentId?: string,
        ): Row<TData>[] => {
          // Grouping depth has been met
          // Stop grouping and simply rewrite the depth and row relationships
          if (depth >= existingGrouping.length) {
            const processedRows: Row<TData>[] = [];

            for (const row of rows) {
              // Check leaf row visibility
              if (groupVisibility[row.id] === false) {
                continue; // Skip hidden leaf rows
              }

              row.depth = depth;

              // Add to flat arrays immediately
              groupedFlatRows.push(row);
              groupedRowsById[row.id] = row;

              if (row.subRows.length > 0) {
                row.subRows = groupUpRecursively(
                  row.subRows,
                  depth + 1,
                  row.id,
                );

                // If hideEmptyGroups is enabled and subRows became empty, skip this row
                if (hideEmptyGroups && row.subRows.length === 0) {
                  continue;
                }
              }

              processedRows.push(row);
            }

            return processedRows;
          }

          const columnId = existingGrouping[depth]!;

          // Group the rows together for this level
          const rowGroupsMap = groupBy(rows, columnId);

          // Perform aggregations for each group
          const aggregatedGroupedRows: Row<TData>[] = [];

          for (const [groupingValue, groupedRows] of rowGroupsMap.entries()) {
            let id = createGroupId(columnId, groupingValue);
            id = parentId ? `${parentId}>${id}` : id;

            // PRIORITY 1: Check visibility BEFORE processing this group
            if (groupVisibility[id] === false) {
              continue; // Skip this entire group and its subtree
            }

            // Recurse to group sub rows before aggregation
            const subRows = groupUpRecursively(groupedRows, depth + 1, id);

            // PRIORITY 2: Check if group is empty (after filtering subRows by visibility)
            if (hideEmptyGroups && subRows.length === 0) {
              continue; // Skip empty groups when hideEmptyGroups is enabled
            }

            subRows.forEach((subRow) => {
              subRow.parentId = id;
            });

            // Flatten the leaf rows of the rows in this group
            const leafRows = depth
              ? flattenBy(groupedRows, (row) => row.subRows)
              : groupedRows;

            const row = createRow(
              table,
              id,
              leafRows[0]!.original,
              aggregatedGroupedRows.length, // Use current length as index
              depth,
              undefined,
              parentId,
            );

            Object.assign(row, {
              groupingColumnId: columnId,
              groupingValue,
              subRows,
              leafRows,
              getValue: (columnId: string) => {
                // Don't aggregate columns that are in the grouping
                if (existingGrouping.includes(columnId)) {
                  if (Object.hasOwn(row._valuesCache, columnId)) {
                    return row._valuesCache[columnId];
                  }

                  if (groupedRows[0]) {
                    row._valuesCache[columnId] =
                      groupedRows[0].getValue(columnId) ?? undefined;
                  }

                  return row._valuesCache[columnId];
                }

                if (Object.hasOwn(row._groupingValuesCache, columnId)) {
                  return row._groupingValuesCache[columnId] as unknown;
                }

                // Aggregate the values
                const column = table.getColumn(columnId);
                const aggregateFn = column?.getAggregationFn();

                if (aggregateFn) {
                  row._groupingValuesCache[columnId] = aggregateFn(
                    columnId,
                    leafRows,
                    groupedRows,
                  ) as unknown;

                  return row._groupingValuesCache[columnId] as unknown;
                }
              },
            });

            // Add subRows to flat arrays during recursion
            subRows.forEach((subRow) => {
              groupedFlatRows.push(subRow);
              groupedRowsById[subRow.id] = subRow;
            });

            aggregatedGroupedRows.push(row);
          }

          return aggregatedGroupedRows;
        };

        let groupedRows = groupUpRecursively(rowModel.rows, 0);

        // Apply custom ordering based on row IDs if groupOrder is defined
        if (groupOrder.length > 0) {
          groupedRows = reorderGroupsByRowId(groupedRows, groupOrder);
        }

        // Add top-level groups to flat arrays
        groupedRows.forEach((subRow) => {
          groupedFlatRows.push(subRow);
          groupedRowsById[subRow.id] = subRow;
        });

        return {
          rows: groupedRows,
          flatRows: groupedFlatRows,
          rowsById: groupedRowsById,
        };
      },
      getMemoOptions(table.options, "debugTable", "getGroupedRowModel", () => {
        table._queue(() => {
          table._autoResetExpanded();
          table._autoResetPageIndex();
        });
      }),
    );
}

function groupBy<TData extends RowData>(rows: Row<TData>[], columnId: string) {
  const groupMap = new Map<ComparableValue, Row<TData>[]>();

  return rows.reduce((map, row) => {
    const resKey = row.getGroupingValue(columnId);
    const previous = map.get(resKey);
    if (!previous) {
      map.set(resKey, [row]);
    } else {
      previous.push(row);
    }
    return map;
  }, groupMap);
}

/**
 * Reorder groups according to row ID order - O(n + m) time complexity
 * @param groups - The grouped rows to reorder
 * @param groupOrder - Array of row IDs in the desired order
 * @returns Reordered array of groups
 */
function reorderGroupsByRowId<TData extends RowData>(
  groups: Row<TData>[],
  groupOrder: string[],
): Row<TData>[] {
  if (groupOrder.length === 0) {
    return groups;
  }

  // Create a map of row ID to the actual row object - O(n)
  const rowMap = new Map<string, Row<TData>>();
  groups.forEach((row) => {
    rowMap.set(row.id, row);
  });

  // Build the result array in the specified order - O(m)
  const orderedGroups: Row<TData>[] = [];
  const usedIds = new Set<string>();

  // First, add rows in the specified order
  for (const rowId of groupOrder) {
    const row = rowMap.get(rowId);
    if (row) {
      orderedGroups.push(row);
      usedIds.add(rowId);
    }
  }

  // Then, append any remaining rows not in groupOrder (maintain their original order)
  for (const row of groups) {
    if (!usedIds.has(row.id)) {
      orderedGroups.push(row);
    }
  }

  return orderedGroups;
}
