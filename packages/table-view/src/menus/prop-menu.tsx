import { flexRender, functionalUpdate } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import {
  appendFilterNode,
  createFilterRule,
  TableViewMenuPage,
} from "@notion-kit/table-hook";
import type { ConfigMenuProps } from "@/plugins";
import {
  DropdownMenuContent,
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

/**
 * @summary The definition of the property
 *
 * 0. ✅ Edit property config
 * 1. ✅ Change type
 * ---
 * 2. 🚧 Filter
 * 3. ✅ Sorting
 * 4. ✅ Grouping
 * 5. ✅ Calculate
 * 6. ✅ Freeze up to column
 * 7. ✅ Hide in view
 * 8. ✅ Wrap column
 * ---
 * 9. ✅ Insert left/right
 * 10. ✅ Duplicate property
 * 11. ✅ Delete property
 */
export function PropMenu({ propId, view }: PropMenuProps) {
  const { filterMenu } = useMenuCoordinator();
  const { table, plugins } = useTableViewCtx();

  const info = table.getColumnInfo(propId);
  const plugin = table.getColumnPlugin(propId);
  const uiPlugin = plugins.getUiPlugin(plugin.id);

  // 3. Sorting
  const defaultSortingMethod = getDefaultSortingMethod(plugin);
  const sortingLabels = getSortingDirectionLabels(defaultSortingMethod);
  const sortColumn = (desc: boolean) => {
    if (defaultSortingMethod) {
      table.setColumnSortingMethod(propId, defaultSortingMethod.id);
    }
    table.setSorting([{ id: propId, desc }]);
  };
  // 2. Filter
  const addFilter = () => {
    const operator = plugin.filtering?.operators[0];
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
  // 6. Pin columns
  const canFreeze = table.getCanFreezeColumn(propId);
  const canUnfreeze = table.getFreezingState()?.colId === propId;
  const pinColumns = () => table.toggleColumnFreezed(propId);
  // 7. Hide in view
  const hideProp = () => table.setColumnInfo(propId, { hidden: true });
  // 8. Wrap in view
  const wrapProp = () => table.toggleColumnWrapped(propId, (v) => !v);
  // 9. Insert left/right
  const insertColumn = (side: "left" | "right") => {
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.CreateProp,
      data: { at: { id: propId, side } },
    });
  };
  // 10. Duplicate property
  const duplicateProp = () => table.duplicateColumnInfo(propId);
  // 11. Delete property
  const deleteProp = () => table.setColumnInfo(propId, { isDeleted: true });

  return (
    <>
      <PropMeta propId={propId} type={info.type} />
      <DropdownMenuGroup>
        {flexRender<ConfigMenuProps>(uiPlugin.renderConfigMenu, {
          propId,
          config: info.config ?? plugin.default.config,
          onChange: (updater) =>
            table._setColumnInfo(propId, (prev) => ({
              ...prev,
              config: functionalUpdate(updater, prev.config),
            })),
        })}
        {info.type !== "title" && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              icon={<Icon.ArrowSquarePathUpDown />}
              label="Change type"
            />
            <DropdownMenuContent sideOffset={-4} className="w-50">
              <TypesMenu propId={propId} menu={null} />
            </DropdownMenuContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuGroup>
      {view === "table" && (
        <>
          <Separator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              icon={<Icon.FilterSmall />}
              label="Filter"
              onClick={addFilter}
            />
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
            <table.Subscribe selector={(state) => state.grouping}>
              {(grouping) => (
                <DropdownMenuItem
                  icon={<Icon.SquareGridBelowLines />}
                  label={grouping.includes(propId) ? "Ungroup" : "Group"}
                  onClick={() =>
                    table.setGroupingColumn((v) =>
                      v === propId ? null : propId,
                    )
                  }
                />
              )}
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
            <DropdownMenuItem
              onClick={duplicateProp}
              icon={<Icon.Duplicate />}
              label="Duplicate property"
            />
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
