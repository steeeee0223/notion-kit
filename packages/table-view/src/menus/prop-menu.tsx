"use client";

import React from "react";

import { MenuGroup, MenuItem, Separator } from "@notion-kit/shadcn";

import "../view.css";

import { Icon } from "@notion-kit/icons";

import { PropMeta } from "../common";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { EditPropMenu } from "./edit-prop-menu";
import { useMenuControl } from "./menu-control-context";

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
 * 4. ✅ Freeze up to column
 * 5. ✅ Hide in view
 * 6. ✅ Wrap column
 * ---
 * 7. ✅ Duplicate property
 * 8. ✅ Delete property
 */
export const PropMenu: React.FC<PropMenuProps> = ({ propId, rect }) => {
  const { table, properties, isPropertyUnique, canFreezeProperty } =
    useTableViewCtx();
  const { updateColumn, duplicateColumn, freezeColumns } = useTableActions();
  const { openPopover, closePopover } = useMenuControl();

  const property = properties[propId]!;

  // 1. Edit property
  const openEditPropMenu = () => {
    openPopover(<EditPropMenu propId={propId} />, {
      x: rect?.x,
      y: rect?.bottom,
    });
  };
  // 4. Pin columns
  const canFreeze = canFreezeProperty(property.id);
  const canUnfreeze = table.getColumn(property.id)?.getIsLastColumn("left");
  const pinColumns = () => {
    freezeColumns(canUnfreeze ? null : property.id);
    closePopover();
  };
  // 5. Hide in view
  const hideProp = () => {
    updateColumn(property.id, { hidden: true });
    closePopover();
  };
  // 6. Wrap in view
  const wrapProp = () =>
    updateColumn(property.id, { wrapped: !property.wrapped });
  // 7. Duplicate property
  const duplicateProp = () => {
    duplicateColumn(property.id);
    closePopover();
  };
  // 8. Delete property
  const deleteProp = () => {
    updateColumn(property.id, { isDeleted: true });
    closePopover();
  };

  return (
    <>
      <PropMeta
        property={property}
        validateName={isPropertyUnique}
        onUpdate={(data) => updateColumn(property.id, data)}
        onKeyDownUpdate={closePopover}
      />
      <MenuGroup>
        <MenuItem
          className="px-3"
          onClick={openEditPropMenu}
          Icon={<Icon.Sliders className="size-5 fill-inherit" />}
          Body="Edit property"
        />
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          disabled={!canFreeze}
          onClick={pinColumns}
          {...(canUnfreeze
            ? { Icon: <Icon.PinStrikeThrough />, Body: "Unfreeze columns" }
            : { Icon: <Icon.Pin />, Body: "Freeze up to column" })}
          className="[&_svg]:mx-1.5 [&_svg]:h-full [&_svg]:w-3 [&_svg]:fill-icon"
        />
        {property.type !== "title" && (
          <MenuItem
            onClick={hideProp}
            Icon={<Icon.EyeHideInversePadded className="size-6 fill-icon" />}
            Body="Hide in view"
          />
        )}
        <MenuItem
          onClick={wrapProp}
          {...(property.wrapped
            ? { Icon: <Icon.ArrowLineRight />, Body: "Unwrap text" }
            : { Icon: <Icon.ArrowUTurnDownLeft />, Body: "Wrap text" })}
          Body="Wrap column"
          className="[&_svg]:mx-0.5 [&_svg]:size-5"
        />
      </MenuGroup>
      {property.type !== "title" && (
        <>
          <Separator />
          <MenuGroup>
            <MenuItem
              onClick={duplicateProp}
              Icon={<Icon.Duplicate className="h-4 w-6 fill-icon" />}
              Body="Duplicate property"
            />

            <MenuItem
              variant="warning"
              className="group/trash"
              onClick={deleteProp}
              Icon={
                <Icon.Trash className="mx-1 h-auto w-4 fill-icon group-hover/trash:fill-red" />
              }
              Body="Delete property"
            />
          </MenuGroup>
        </>
      )}
    </>
  );
};
