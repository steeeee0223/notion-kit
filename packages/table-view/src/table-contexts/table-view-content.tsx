import { BulkEditBar } from "@/common/bulk-edit/bulk-edit-bar";
import { DndTableBody } from "@/table-body";
import { TableFooter } from "@/table-footer";
import { TableHeader } from "@/table-header";

import { useTableViewCtx } from "./table-view-provider";

export function TableViewContent() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        columnResizing: state.columnResizing,
        columnSizing: state.columnSizing,
        locked: state.tableGlobal.locked,
      })}
    >
      {({ locked }) => {
        /**
         * Instead of calling `column.getSize()` on every render for every header
         * and especially every data cell (very expensive),
         * we will calculate all column sizes at once at the root table level in a useMemo
         * and pass the column sizes down as CSS variables to the <table> element.
         */
        const columnSizeVars = table
          .getFlatHeaders()
          .reduce<Record<string, number>>(
            (sizes, header) => ({
              ...sizes,
              [`--header-${header.id}-size`]: header.getSize(),
              [`--col-${header.column.id}-size`]: header.column.getSize(),
            }),
            {},
          );

        return (
          <div
            role="table"
            id="notion-table-view"
            className="relative float-left min-w-full px-24 pb-0 lining-nums tabular-nums select-none"
          >
            <div className="absolute z-9990 w-full" />
            <BulkEditBar disabled={locked} />
            <div className="pointer-events-none mt-0 h-0" />
            <div
              data-block-id="15f35e0f-492c-8003-9976-f8ae747a6aeb"
              className="relative"
              style={columnSizeVars}
            >
              {/* Header row */}
              <TableHeader />
              {/* Table body */}
              <DndTableBody />
              {/* Table footer */}
              <TableFooter />
            </div>
            <div className="pointer-events-none clear-both mt-0 h-0 translate-y-0" />
            <div className="absolute z-9990 w-full translate-y-[-34px]" />
          </div>
        );
      }}
    </table.Subscribe>
  );
}
