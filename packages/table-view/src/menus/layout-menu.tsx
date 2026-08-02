import { v4 } from "uuid";

import { cn } from "@notion-kit/cn";
import {
  LAYOUT_OPTIONS,
  ROW_VIEW_OPTIONS,
  RowViewType,
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
import { useTableViewCtx } from "@/table-contexts";
import { isUsableTimelineDateProperty } from "@/timeline-view";

export function LayoutMenu() {
  const { table } = useTableViewCtx();

  return (
    <table.Subscribe
      selector={(state) => ({
        currentLayout: state.tableGlobal.layout,
        datePropertyId: state.tableGlobal.timeline!.datePropertyId,
        columnOrder: state.columnOrder,
        columnsInfo: state.columnsInfo,
      })}
    >
      {(state) => <LayoutMenuContent {...state} />}
    </table.Subscribe>
  );
}

function LayoutMenuContent({
  currentLayout,
  datePropertyId,
  columnOrder,
  columnsInfo,
}: {
  currentLayout: ReturnType<
    TableInstance["atoms"]["tableGlobal"]["get"]
  >["layout"];
  datePropertyId: string | null;
  columnOrder: string[];
  columnsInfo: ReturnType<TableInstance["atoms"]["columnsInfo"]["get"]>;
}) {
  const { table } = useTableViewCtx();
  const dateProperties = columnOrder.flatMap((id) => {
    const property = columnsInfo[id];
    return property && isUsableTimelineDateProperty(property) ? [property] : [];
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
                layout.value !== "table" &&
                layout.value !== "list" &&
                layout.value !== "board" &&
                layout.value !== "timeline"
              }
            >
              <LayoutIcon layout={layout.value} />
              <div className="text-center">{layout.label}</div>
            </Button>
          ))}
        </div>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        {currentLayout === "timeline" && dateProperties.length > 0 && (
          <TimelineDatePropertyMenu
            current={datePropertyId}
            properties={dateProperties}
          />
        )}
        <RowViewMenu />
      </DropdownMenuGroup>
    </>
  );
}

function TimelineDatePropertyMenu({
  current,
  properties,
}: {
  current: string | null;
  properties: ReturnType<
    TableInstance["atoms"]["columnsInfo"]["get"]
  >[string][];
}) {
  const { table } = useTableViewCtx();
  const currentName = properties.find(
    (property) => property.id === current,
  )?.name;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger label="Timeline by">
        <MenuItemAction className="flex items-center text-muted">
          {currentName}
        </MenuItemAction>
      </DropdownMenuSubTrigger>
      <DropdownMenuContent sideOffset={-4} className="w-64">
        <DropdownMenuRadioGroup
          value={current ?? ""}
          onValueChange={(propertyId: string) => {
            if (propertyId === current) return;
            table.setTimelineDateProperty(propertyId);
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
            <DropdownMenuRadioGroup
              value={current}
              onValueChange={(rowView: RowViewType) => {
                if (rowView === current) return;
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
