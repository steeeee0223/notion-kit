import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import {
  LAYOUT_OPTIONS,
  ROW_VIEW_OPTIONS,
  type ColumnInfo,
  type LayoutType,
  type RowViewType,
  type TableInstance,
} from "@notion-kit/table-hook";
import {
  Button,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

import { LayoutIcon, MenuHeader, RowViewIcon } from "@/common";
import { isUsableDateProperty } from "@/date-view/date-property";
import { useTableViewCtx } from "@/table-contexts";

export function LayoutMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        currentLayout: state.tableGlobal.layout,
        locked: Boolean(state.tableGlobal.locked),
        datePropertyId: state.tableGlobal.dateView!.datePropertyId,
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
      })}
    >
      {(state) => <LayoutMenuContent {...state} />}
    </table.Subscribe>
  );
}

function LayoutMenuContent({
  locked,
  currentLayout,
  datePropertyId,
  columnOrder,
  columnsInfo,
}: {
  locked: boolean;
  currentLayout: LayoutType;
  datePropertyId: string | null;
  columnOrder: string[];
  columnsInfo: ReturnType<TableInstance["atoms"]["columnsInfo"]["get"]>;
}) {
  const { table } = useTableViewCtx();
  const dateProperties = columnOrder.flatMap((id) => {
    const property = columnsInfo[id];
    return property && isUsableDateProperty(property) ? [property] : [];
  });

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
                locked ||
                (layout.value !== "table" &&
                  layout.value !== "list" &&
                  layout.value !== "board" &&
                  layout.value !== "timeline" &&
                  layout.value !== "calendar")
              }
            >
              <LayoutIcon layout={layout.value} />
              <div className="text-center">{layout.label}</div>
            </Button>
          ))}
        </div>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        {(currentLayout === "timeline" || currentLayout === "calendar") &&
          dateProperties.length > 0 && (
            <DatePropertyMenu
              locked={locked}
              layout={currentLayout}
              current={datePropertyId}
              properties={dateProperties}
            />
          )}
        <RowViewMenu locked={locked} />
      </DropdownMenuGroup>
    </>
  );
}

function DatePropertyMenu({
  locked,
  layout,
  current,
  properties,
}: {
  locked: boolean;
  layout: "calendar" | "timeline";
  current: string | null;
  properties: ColumnInfo[];
}) {
  const { table } = useTableViewCtx();
  const currentProperty =
    properties.find((property) => property.id === current) ?? properties[0]!;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={locked}
        label={layout === "calendar" ? "Calendar by" : "Timeline by"}
      >
        <MenuItemAction className="flex items-center text-muted">
          {currentProperty.name}
        </MenuItemAction>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4} className="w-64">
        <DropdownMenuRadioGroup
          value={currentProperty.id}
          onValueChange={(propertyId: string) => {
            if (locked || propertyId === currentProperty.id) return;
            table.setDateViewDateProperty(propertyId);
          }}
        >
          {properties.map((property) => (
            <DropdownMenuRadioItem
              key={property.id}
              value={property.id}
              closeOnClick={false}
              label={property.name}
            />
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuSub>
  );
}

function RowViewMenu({ locked }: { locked: boolean }) {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe selector={(state) => state.tableGlobal.rowView}>
      {(current) => (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={locked} label="Open pages in">
            <MenuItemAction className="flex items-center text-muted">
              {ROW_VIEW_OPTIONS[current].label}
            </MenuItemAction>
          </DropdownMenuSubTrigger>
          <DropdownMenuContent sideOffset={-4} className="w-64">
            <DropdownMenuRadioGroup
              value={current}
              onValueChange={(rowView: RowViewType) => {
                if (locked || rowView === current) return;
                const actionId = v4();
                table.setTableGlobalState(
                  (v) => ({ ...v, rowView }),
                  (previous, next) => ({
                    id: actionId,
                    type: "view.row_display.change",
                    payload: {
                      previousRowView: previous.rowView,
                      nextRowView: next.rowView,
                    },
                  }),
                );
              }}
            >
              {Object.entries(ROW_VIEW_OPTIONS).map(([value, option]) => {
                const rowView = value as RowViewType;
                return (
                  <DropdownMenuRadioItem
                    key={rowView}
                    value={rowView}
                    closeOnClick={false}
                    icon={<RowViewIcon rowView={rowView} />}
                    label={option.label}
                    desc={option.desc}
                  />
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuSub>
      )}
    </table.Subscribe>
  );
}
