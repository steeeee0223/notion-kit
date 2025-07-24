"use client";

import React from "react";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  Separator,
  useMenu,
} from "@notion-kit/shadcn";

import { PropMeta } from "../common";
import { CountMethod } from "../lib/types";
import { extractPropConfig } from "../lib/utils";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { CalcMenu } from "./calc-menu";
import { PropConfig } from "./prop-config";
import { TypesMenu } from "./types-menu";

interface PropMenuProps {
  propId: string;
}

/**
 * @summary The definition of the property
 *
 * 0. 🚧 Edit property config
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
  const { table, properties, isPropertyUnique, canFreezeProperty } =
    useTableViewCtx();
  const { updateColumn, duplicate, freezeColumns } = useTableActions();
  const { openMenu } = useMenu();

  const property = properties[propId]!;

  // 3. Sorting
  const sortColumn = (desc: boolean) =>
    table.setSorting([{ id: propId, desc }]);
  // 6. Pin columns
  const canFreeze = canFreezeProperty(property.id);
  const canUnfreeze = table.getColumn(property.id)?.getIsLastColumn("left");
  const pinColumns = () => freezeColumns(canUnfreeze ? null : property.id);
  // 7. Hide in view
  const hideProp = () => updateColumn(property.id, { hidden: true });
  // 8. Wrap in view
  const wrapProp = () =>
    updateColumn(property.id, { wrapped: !property.wrapped });
  // 9. Insert left/right
  const insertColumn = (side: "left" | "right") => {
    openMenu(<TypesMenu propId={null} at={{ id: propId, side }} />, {
      x: -12,
      y: -12,
    });
  };
  // 10. Duplicate property
  const duplicateProp = () => duplicate(property.id, "col");
  // 11. Delete property
  const deleteProp = () => updateColumn(property.id, { isDeleted: true });

  return (
    <>
      <PropMeta
        property={property}
        validateName={isPropertyUnique}
        onUpdate={(data) => updateColumn(property.id, data)}
      />
      <DropdownMenuGroup>
        <PropConfig propId={propId} meta={extractPropConfig(property)} />
        {property.type !== "title" && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              Icon={<Icon.ArrowSquarePathUpDown />}
              Body="Change type"
            />
            <DropdownMenuSubContent sideOffset={-4} className="w-50">
              <TypesMenu propId={propId} showHeader={false} />
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger Icon={<Icon.Sum />} Body="Calculate" />
          <DropdownMenuSubContent
            sideOffset={-4}
            className="w-50"
            collisionPadding={12}
          >
            <CalcMenu
              id={propId}
              type={property.type}
              countMethod={property.countMethod ?? CountMethod.NONE}
              isCountCapped={property.isCountCapped}
            />
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
        {property.type !== "title" && (
          <DropdownMenuItem
            onSelect={hideProp}
            Icon={<Icon.EyeHideInversePadded className="size-6" />}
            Body="Hide in view"
          />
        )}
        <DropdownMenuItem
          onSelect={wrapProp}
          {...(property.wrapped
            ? { Icon: <Icon.ArrowLineRight />, Body: "Unwrap text" }
            : { Icon: <Icon.ArrowUTurnDownLeft />, Body: "Wrap text" })}
          className="[&_svg]:fill-icon"
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
        {property.type !== "title" && (
          <>
            <DropdownMenuItem
              onSelect={duplicateProp}
              Icon={<Icon.Duplicate className="h-4" />}
              Body="Duplicate property"
            />
            <DropdownMenuItem
              variant="warning"
              onSelect={deleteProp}
              Icon={<Icon.Trash className="size-4" />}
              Body="Delete property"
            />
          </>
        )}
      </DropdownMenuGroup>
    </>
  );
}
