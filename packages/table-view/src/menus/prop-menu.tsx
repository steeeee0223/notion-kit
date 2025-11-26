"use client";

import { flexRender, functionalUpdate } from "@tanstack/react-table";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  Separator,
} from "@notion-kit/shadcn";

import { PropMeta } from "../common";
import { TableViewMenuPage } from "../features";
import { ConfigMenuProps } from "../plugins";
import { useTableViewCtx } from "../table-contexts";
import { CalcMenu } from "./calc-menu";
import { TypesMenu } from "./types-menu";

interface PropMenuProps {
  propId: string;
}

/**
 * @summary The definition of the property
 *
 * 0. ✅ Edit property config
 * 1. ✅ Change type
 * ---
 * 2. 🚧 Filter
 * 3. ✅ Sorting
 * 4. 🚧 Group
 * 5. ✅ Calculate
 * 6. ✅ Freeze up to column
 * 7. ✅ Hide in view
 * 8. ✅ Wrap column
 * ---
 * 9. ✅ Insert left/right
 * 10. ✅ Duplicate property
 * 11. ✅ Delete property
 */
export function PropMenu({ propId }: PropMenuProps) {
  const { table } = useTableViewCtx();

  const column = table.getColumn(propId)!;
  const info = table.getColumnInfo(propId);
  const plugin = table.getColumnPlugin(propId);

  // 3. Sorting
  const sortColumn = (desc: boolean) =>
    table.setSorting([{ id: propId, desc }]);
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
        {flexRender<ConfigMenuProps>(plugin.renderConfigMenu, {
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
              Icon={<Icon.ArrowSquarePathUpDown />}
              Body="Change type"
            />
            <DropdownMenuSubContent sideOffset={-4} className="w-50">
              <TypesMenu propId={propId} menu={null} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuGroup>
      <Separator />
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger Icon={<Icon.ArrowUpDown />} Body="Sort" />
          <DropdownMenuSubContent sideOffset={-4} className="w-50">
            <DropdownMenuGroup>
              <DropdownMenuItem
                Icon={<Icon.ArrowUp className="size-4" />}
                Body="Sort ascending"
                onSelect={() => sortColumn(false)}
              />
              <DropdownMenuItem
                Icon={<Icon.ArrowDown className="size-4" />}
                Body="Sort descending"
                onSelect={() => sortColumn(true)}
              />
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          Icon={<Icon.SquareGridBelowLines />}
          Body={column.getIsGrouped() ? "Ungroup" : "Group"}
          onSelect={() =>
            table.setGrouping((v) => (v[0] === propId ? [] : [propId]))
          }
        />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger Icon={<Icon.Sum />} Body="Calculate" />
          <DropdownMenuSubContent
            sideOffset={-4}
            className="w-50"
            collisionPadding={12}
          >
            <CalcMenu id={propId} type={info.type} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          disabled={!canFreeze}
          onSelect={pinColumns}
          {...(canUnfreeze
            ? { Icon: <Icon.PinStrikeThrough />, Body: "Unfreeze columns" }
            : { Icon: <Icon.Pin />, Body: "Freeze up to column" })}
          className="[&_svg]:w-3"
        />
        {info.type !== "title" && (
          <DropdownMenuItem
            onSelect={hideProp}
            Icon={<Icon.EyeHideInversePadded className="size-6" />}
            Body="Hide in view"
          />
        )}
        <DropdownMenuItem
          onSelect={wrapProp}
          {...(info.wrapped
            ? { Icon: <Icon.ArrowLineRight />, Body: "Unwrap text" }
            : { Icon: <Icon.ArrowUTurnDownLeft />, Body: "Wrap text" })}
        />
      </DropdownMenuGroup>
      <Separator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          onSelect={() => insertColumn("left")}
          Icon={<Icon.ArrowRectangle side="left" />}
          Body="Insert left"
        />
        <DropdownMenuItem
          onSelect={() => insertColumn("right")}
          Icon={<Icon.ArrowRectangle side="right" />}
          Body="Insert right"
        />
        {info.type !== "title" && (
          <>
            <DropdownMenuItem
              onSelect={duplicateProp}
              Icon={<Icon.Duplicate />}
              Body="Duplicate property"
            />
            <DropdownMenuItem
              variant="warning"
              onSelect={deleteProp}
              Icon={<Icon.Trash />}
              Body="Delete property"
            />
          </>
        )}
      </DropdownMenuGroup>
    </>
  );
}
