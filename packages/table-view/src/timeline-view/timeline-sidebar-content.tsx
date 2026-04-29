import {
  TimelineSidebar,
  TimelineSidebarBody,
  TimelineSidebarClose,
  TimelineSidebarHeader,
} from "@notion-kit/timeline";

import { DndTableBody } from "../table-body";
import { useTableViewCtx } from "../table-contexts";
import { TableFooter } from "../table-footer";
import {
  TableHeaderCellResizer,
  TableHeaderCellTrigger,
} from "../table-header";

export function TimelineSidebarContent() {
  const { table } = useTableViewCtx();
  const { locked } = table.getTableGlobalState();
  const titleColId = table.getTitleColumnId();

  // TODO: don't find header this way
  const header = table
    .getLeafHeaders()
    .find((header) => header.column.id === titleColId);
  const isResizing = header?.column.getIsResizing();
  const onResizeStart = header?.getResizeHandler();
  const onResizeEnd = header?.column.handleResizeEnd;

  return (
    <TimelineSidebar style={table.getColumnSizeVariables()}>
      <TimelineSidebarHeader className="z-(--z-col) flex h-17 text-secondary shadow-header-row">
        {/* Header */}
        <div className="m-0 inline-flex">
          <div className="flex cursor-grab flex-row">
            <div className="relative flex">
              <TableHeaderCellTrigger
                info={table.getColumnInfo(titleColId)}
                width={table.getColumn(titleColId)?.getWidth()}
                className="pt-9"
                disabled={locked}
              />
              <TableHeaderCellResizer
                className="h-17"
                isResizing={isResizing}
                // Resize for desktop
                onMouseDown={onResizeStart}
                onMouseUp={onResizeEnd}
                // Resize for mobile
                onTouchStart={onResizeStart}
                onTouchEnd={onResizeEnd}
              />
            </div>
          </div>
        </div>
        <TimelineSidebarClose onClick={table.toggleSidebar} />
      </TimelineSidebarHeader>
      <TimelineSidebarBody>
        {/* Table body & add row button */}
        <DndTableBody />
        {/* Table footer */}
        <TableFooter />
      </TimelineSidebarBody>
    </TimelineSidebar>
  );
}
