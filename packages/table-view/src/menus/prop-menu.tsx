import { flexRender } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import {
  appendFilterNode,
  createFilterRule,
  getFilterOperators,
  TableViewMenuPage,
} from "@notion-kit/table-hook";
import {
  DropdownMenuContent,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  Separator,
} from "@notion-kit/ui/primitives";

import { PropMeta } from "@/common";
import {
  FILTER_MENU_TOOLBAR_TRIGGER_ID,
  useMenuCoordinator,
  useTableViewCtx,
} from "@/table-contexts";

import { CalcMenu } from "./calc-menu";
import {
  getDefaultSortingMethod,
  getSortingDirectionLabels,
} from "./sorting-options";
import { TypesMenu } from "./types-menu";

const INSERT_SIDES = ["left", "right"] as const;

interface PropMenuProps {
  propId: string;
  view: "table" | "row";
}

export function PropMenu({ propId, view }: PropMenuProps) {
  const { filterMenu } = useMenuCoordinator();
  const { table, plugins } = useTableViewCtx();

  const info = table.getColumnInfo(propId);
  const plugin = table.getColumnPlugin(propId);
  const column = table.getColumn(propId);
  if (!column) return null;
  const uiPlugin = plugins.getUiPlugin(plugin.id);

  const defaultSortingMethod = getDefaultSortingMethod(plugin);
  const sortingLabels = getSortingDirectionLabels(defaultSortingMethod);
  const sortColumn = (desc: boolean) => {
    if (defaultSortingMethod) {
      table.setColumnSortingMethod(propId, defaultSortingMethod.id);
    }
    table.setSorting([{ id: propId, desc }]);
  };
  const operator = getFilterOperators(plugin, info.config)[0];
  const addFilter = () => {
    if (!operator) return;
    const filters = table.getFilters();
    table.setFilters(
      appendFilterNode(
        filters,
        filters?.id ?? "",
        createFilterRule(propId, operator.id),
      ),
    );
    filterMenu.handle.open(FILTER_MENU_TOOLBAR_TRIGGER_ID);
  };
  const canFreeze = table.getCanFreezeColumn(propId);
  const canUnfreeze = table.getFreezingState()?.colId === propId;
  const pinColumns = () => table.toggleColumnFreezed(propId);
  const hideProp = () => table.setColumnInfo(propId, { hidden: true });
  const wrapProp = () => table.toggleColumnWrapped(propId, (v) => !v);
  const insertColumn = (side: "left" | "right") => {
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.CreateProp,
      data: { at: { id: propId, side } },
    });
  };
  const duplicateProp = () => table.duplicateColumnInfo(propId);
  const deleteProp = () => table.setColumnInfo(propId, { isDeleted: true });

  return (
    <>
      <PropMeta propId={propId} type={info.type} />
      <DropdownMenuGroup>
        {flexRender(uiPlugin.renderConfigMenu, {
          column,
        })}
        {info.type !== "title" && info.type !== "id" && (
          <DropdownMenuFilter>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                icon={<Icon.ArrowSquarePathUpDown />}
                label="Change type"
              />
              <DropdownMenuContent sideOffset={-4} className="w-50">
                <TypesMenu propId={propId} menu={null} closeOnClick />
              </DropdownMenuContent>
            </DropdownMenuSub>
          </DropdownMenuFilter>
        )}
      </DropdownMenuGroup>
      {view === "table" && (
        <>
          <Separator />
          <DropdownMenuGroup>
            {operator && (
              <DropdownMenuItem
                icon={<Icon.FilterSmall />}
                label="Filter"
                onClick={addFilter}
              />
            )}
            {plugin.canSort?.(info.config) !== false && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  icon={<Icon.ArrowUpDown />}
                  label="Sort"
                />
                <DropdownMenuContent sideOffset={-4} className="w-50">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      icon={<Icon.ArrowUp className="size-4" />}
                      label={sortingLabels.ascending}
                      onClick={() => sortColumn(false)}
                    />
                    <DropdownMenuItem
                      icon={<Icon.ArrowDown className="size-4" />}
                      label={sortingLabels.descending}
                      onClick={() => sortColumn(true)}
                    />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenuSub>
            )}
            <table.Subscribe selector={(state) => state.grouping}>
              {(grouping) =>
                (plugin.canGroup !== false || grouping.includes(propId)) && (
                  <DropdownMenuItem
                    icon={<Icon.SquareGridBelowLines />}
                    label={grouping.includes(propId) ? "Ungroup" : "Group"}
                    onClick={() =>
                      table.setGroupingColumn((v) =>
                        v === propId ? null : propId,
                      )
                    }
                  />
                )
              }
            </table.Subscribe>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<Icon.Sum />} label="Calculate" />
              <DropdownMenuContent
                sideOffset={-4}
                className="w-50"
                collisionPadding={12}
              >
                <CalcMenu id={propId} />
              </DropdownMenuContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              disabled={!canFreeze}
              onClick={pinColumns}
              {...(canUnfreeze
                ? { icon: <Icon.PinStrikeThrough />, label: "Unfreeze columns" }
                : { icon: <Icon.Pin />, label: "Freeze up to column" })}
              className="[&_svg]:w-3"
            />
            {info.type !== "title" && (
              <DropdownMenuItem
                onClick={hideProp}
                icon={<Icon.EyeHideInversePadded className="size-6" />}
                label="Hide in view"
              />
            )}
            <DropdownMenuItem
              onClick={wrapProp}
              {...(info.wrapped
                ? { icon: <Icon.ArrowLineRight />, label: "Unwrap text" }
                : { icon: <Icon.ArrowUTurnDownLeft />, label: "Wrap text" })}
            />
          </DropdownMenuGroup>
        </>
      )}
      <Separator />
      <DropdownMenuGroup>
        {view === "table" &&
          INSERT_SIDES.map((side) => (
            <DropdownMenuItem
              key={side}
              onClick={() => insertColumn(side)}
              icon={<Icon.ArrowRectangle side={side} />}
              label={`Insert ${side}`}
            />
          ))}
        {info.type !== "title" && (
          <>
            {info.type !== "id" && (
              <DropdownMenuItem
                onClick={duplicateProp}
                icon={<Icon.Duplicate />}
                label="Duplicate property"
              />
            )}
            <DropdownMenuItem
              variant="warning"
              onClick={deleteProp}
              icon={<Icon.Trash />}
              label="Delete property"
            />
          </>
        )}
      </DropdownMenuGroup>
    </>
  );
}
