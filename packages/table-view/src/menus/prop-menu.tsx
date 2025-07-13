"use client";

import React from "react";

import { Icon } from "@notion-kit/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuGroup,
  MenuItem,
  Separator,
  useMenu,
} from "@notion-kit/shadcn";

import { PropMeta } from "../common";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { EditPropMenu } from "./edit-prop-menu";

interface PropMenuProps {
  propId: string;
  rect?: DOMRect;
}

/**
 * @summary The definition of the property
 *
 * 1. ✅ Edit property: opens `EditPropMenu`
 * ---
 * 2. 🚧 Filter
 * 3. 🚧 Sorting
 * 4. 🚧 Group
 * 5. 🚧 Calculate
 * 6. ✅ Freeze up to column
 * 7. ✅ Hide in view
 * 8. ✅ Wrap column
 * ---
 * 9. 🚧 Insert left
 * 10. 🚧 Insert right
 * 11. ✅ Duplicate property
 * 12. ✅ Delete property
 */
export const PropMenu: React.FC<PropMenuProps> = ({ propId, rect }) => {
  const { table, properties, isPropertyUnique, canFreezeProperty } =
    useTableViewCtx();
  const { updateColumn, duplicate, freezeColumns } = useTableActions();
  const { openMenu, closeMenu } = useMenu();

  const property = properties[propId]!;

  // 1. Edit property
  const openEditPropMenu = () => {
    openMenu(<EditPropMenu propId={propId} />, {
      x: rect?.x,
      y: rect?.bottom,
    });
  };
  // 3. Sorting
  const sortColumn = (desc: boolean) => {
    table.setSorting([{ id: propId, desc }]);
    closeMenu();
  };
  // 6. Pin columns
  const canFreeze = canFreezeProperty(property.id);
  const canUnfreeze = table.getColumn(property.id)?.getIsLastColumn("left");
  const pinColumns = () => {
    freezeColumns(canUnfreeze ? null : property.id);
    closeMenu();
  };
  // 7. Hide in view
  const hideProp = () => {
    updateColumn(property.id, { hidden: true });
    closeMenu();
  };
  // 8. Wrap in view
  const wrapProp = () =>
    updateColumn(property.id, { wrapped: !property.wrapped });
  // 11. Duplicate property
  const duplicateProp = () => {
    duplicate(property.id, "col");
    closeMenu();
  };
  // 12. Delete property
  const deleteProp = () => {
    updateColumn(property.id, { isDeleted: true });
    closeMenu();
  };

  return (
    <>
      <PropMeta
        property={property}
        validateName={isPropertyUnique}
        onUpdate={(data) => updateColumn(property.id, data)}
        onKeyDownUpdate={closeMenu}
      />
      <MenuGroup>
        <MenuItem
          onClick={openEditPropMenu}
          Icon={<Icon.Sliders className="fill-icon" />}
          Body="Edit property"
        />
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MenuItem Icon={<Icon.ArrowUpDown />} Body="Sort" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={0} className="w-50">
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
          </DropdownMenuContent>
        </DropdownMenu>
        <MenuItem
          disabled={!canFreeze}
          onClick={pinColumns}
          {...(canUnfreeze
            ? { Icon: <Icon.PinStrikeThrough />, Body: "Unfreeze columns" }
            : { Icon: <Icon.Pin />, Body: "Freeze up to column" })}
          className="[&_svg]:w-3"
        />
        {property.type !== "title" && (
          <MenuItem
            onClick={hideProp}
            Icon={<Icon.EyeHideInversePadded className="size-6" />}
            Body="Hide in view"
          />
        )}
        <MenuItem
          onClick={wrapProp}
          {...(property.wrapped
            ? { Icon: <Icon.ArrowLineRight />, Body: "Unwrap text" }
            : { Icon: <Icon.ArrowUTurnDownLeft />, Body: "Wrap text" })}
          className="[&_svg]:fill-icon"
        />
      </MenuGroup>
      {property.type !== "title" && (
        <>
          <Separator />
          <MenuGroup>
            <MenuItem
              onClick={duplicateProp}
              Icon={<Icon.Duplicate className="h-4" />}
              Body="Duplicate property"
            />
            <MenuItem
              variant="warning"
              onClick={deleteProp}
              Icon={<Icon.Trash className="size-4" />}
              Body="Delete property"
            />
          </MenuGroup>
        </>
      )}
    </>
  );
};
