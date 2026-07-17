import { cn } from "@notion-kit/cn";
import {
  LAYOUT_OPTIONS,
  ROW_VIEW_OPTIONS,
  RowViewType,
} from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

import { LayoutIcon, MenuHeader, RowViewIcon } from "@/common";
import { useTableViewCtx } from "@/table-contexts";

export function LayoutMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal}>
      {(tableGlobal) => <LayoutMenuContent tableGlobal={tableGlobal} />}
    </table.Subscribe>
  );
}

function LayoutMenuContent({
  tableGlobal,
}: {
  tableGlobal: ReturnType<
    typeof useTableViewCtx
  >["table"]["store"]["state"]["tableGlobal"];
}) {
  const { table } = useTableViewCtx();
  const { layout: currentLayout } = tableGlobal;

  return (
    <>
      <MenuHeader
        title="Layout"
        onBack={() => table.setTableMenuState({ open: true, page: null })}
      />
      <DropdownMenuGroup>
        <div className="grid grid-cols-3 gap-2 p-2 pb-0">
          {LAYOUT_OPTIONS.map((layout) => (
            <Button
              key={layout.value}
              aria-selected={currentLayout === layout.value}
              onClick={() => table.setTableLayout(layout.value)}
              className={cn(
                "flex flex-col gap-0 p-1.5 text-xs text-secondary [&_svg]:my-1 [&_svg]:fill-current",
                "aria-selected:text-blue aria-selected:shadow-notion",
              )}
              // TODO Not all layouts are implemented yet
              disabled={
                layout.value !== "table" &&
                layout.value !== "list" &&
                layout.value !== "board"
              }
            >
              <LayoutIcon layout={layout.value} />
              <div className="text-center">{layout.label}</div>
            </Button>
          ))}
        </div>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <RowViewMenu />
      </DropdownMenuGroup>
    </>
  );
}

function RowViewMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.rowView}>
      {(current) => (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger label="Open pages in">
            <MenuItemAction className="flex items-center text-muted">
              {ROW_VIEW_OPTIONS[current].label}
            </MenuItemAction>
          </DropdownMenuSubTrigger>
          <DropdownMenuContent sideOffset={-4} className="w-64">
            <DropdownMenuGroup>
              {Object.entries(ROW_VIEW_OPTIONS).map(([value, option]) => {
                const rowView = value as RowViewType;
                return (
                  <DropdownMenuCheckboxItem
                    key={rowView}
                    closeOnClick={false}
                    icon={<RowViewIcon rowView={rowView} />}
                    label={option.label}
                    desc={option.desc}
                    checked={rowView === current}
                    onCheckedChange={() =>
                      table.setTableGlobalState((v) => ({ ...v, rowView }))
                    }
                  />
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuSub>
      )}
    </table.Subscribe>
  );
}
