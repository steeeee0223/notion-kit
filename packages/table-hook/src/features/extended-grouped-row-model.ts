import type { Row, RowData, RowModel, Table } from "@tanstack/react-table";
import { constructRow, flattenBy, tableMemo } from "@tanstack/react-table";

import type { AnyRowData, AnyTableFeatures } from "@/features/types";
import { createGroupId } from "@/features/utils";
import type { ComparableValue } from "@/plugins";

export function getExtendedGroupedRowModel<TData extends RowData>(): (
  table: Table<AnyTableFeatures, TData>,
) => () => RowModel<AnyTableFeatures, TData> {
  return (table) => {
    const memoTable = table as unknown as Table<AnyTableFeatures, AnyRowData>;

    return tableMemo({
      feature: "columnGroupingFeature",
      table: memoTable,
      fnName: "table.getGroupedRowModel",
      memoDeps: () => [
        table.atoms.grouping.get(),
        table.getPreGroupedRowModel(),
        table.atoms.groupingState.get().groupOrder,
        table.atoms.groupingState.get().groupVisibility,
        table.atoms.groupingState.get().hideEmptyGroups,
      ],
      fn: (
        grouping,
        rowModel,
        groupOrder,
        groupVisibility,
        hideEmptyGroups,
      ) => {
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

        const groupedFlatRows: Row<AnyTableFeatures, TData>[] = [];
        const groupedRowsById: Record<
          string,
          Row<AnyTableFeatures, TData>
        > = {};

        // Recursively group the data with integrated visibility filtering
        const groupUpRecursively = (
          rows: Row<AnyTableFeatures, TData>[],
          depth = 0,
          parentId?: string,
        ): Row<AnyTableFeatures, TData>[] => {
          // Grouping depth has been met
          // Stop grouping and simply rewrite the depth and row relationships
          if (depth >= existingGrouping.length) {
            const processedRows: Row<AnyTableFeatures, TData>[] = [];

            for (const row of rows) {
              // Check leaf row visibility
              if (groupVisibility[row.id] === false) {
                continue; // Skip hidden leaf rows
              }

              row.depth = depth;

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
          const aggregatedGroupedRows: Row<AnyTableFeatures, TData>[] = [];

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
            if (leafRows.length === 0) {
              continue;
            }

            const row = constructRow(
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

            aggregatedGroupedRows.push(row);
          }

          return aggregatedGroupedRows;
        };

        let groupedRows = groupUpRecursively(rowModel.rows, 0);

        // Apply custom ordering based on row IDs if groupOrder is defined
        if (groupOrder.length > 0) {
          groupedRows = reorderGroupsByRowId(groupedRows, groupOrder);
        }

        groupedRows.forEach((row, index) => {
          row.index = index;
        });

        groupedRows.forEach((row) => {
          collectFlatRows(row, groupedFlatRows, groupedRowsById);
        });

        return {
          rows: groupedRows,
          flatRows: groupedFlatRows,
          rowsById: groupedRowsById,
        };
      },
      onAfterUpdate: () => {
        table.autoResetExpanded();
      },
    });
  };
}

function collectFlatRows<TData extends RowData>(
  row: Row<AnyTableFeatures, TData>,
  flatRows: Row<AnyTableFeatures, TData>[],
  rowsById: Record<string, Row<AnyTableFeatures, TData>>,
) {
  flatRows.push(row);
  rowsById[row.id] = row;
  row.subRows.forEach((subRow) => {
    collectFlatRows(subRow, flatRows, rowsById);
  });
}

function groupBy<TData extends RowData>(
  rows: Row<AnyTableFeatures, TData>[],
  columnId: string,
) {
  const groupMap = new Map<ComparableValue, Row<AnyTableFeatures, TData>[]>();

  return rows.reduce((map, row) => {
    const resKey = row.getGroupingValue(columnId) as ComparableValue;
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
  groups: Row<AnyTableFeatures, TData>[],
  groupOrder: string[],
): Row<AnyTableFeatures, TData>[] {
  if (groupOrder.length === 0) {
    return groups;
  }

  // Create a map of row ID to the actual row object - O(n)
  const rowMap = new Map<string, Row<AnyTableFeatures, TData>>();
  groups.forEach((row) => {
    rowMap.set(row.id, row);
  });

  // Build the result array in the specified order - O(m)
  const orderedGroups: Row<AnyTableFeatures, TData>[] = [];
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
