"use client";

import React from "react";

import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Separator,
  Switch,
} from "@notion-kit/shadcn";

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
 * 2. 🚧 Sorting
 * 3. 🚧 Filter
 * 4. ✅ Hide in view
 * 5. ✅ Freeze up to column
 * 6. ✅ Duplicate property
 * 7. ✅ Delete property
 * 8. ✅ Wrap column
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
  // 4. Hide in view
  const hideProp = () => {
    updateColumn(property.id, { hidden: true });
    closePopover();
  };
  // 5. Pin columns
  const canFreeze = canFreezeProperty(property.id);
  const canUnfreeze = table.getColumn(property.id)?.getIsLastColumn("left");
  const pinColumns = () => {
    freezeColumns(canUnfreeze ? null : property.id);
    closePopover();
  };
  // 6. Duplicate property
  const duplicateProp = () => {
    duplicateColumn(property.id);
    closePopover();
  };
  // 7. Delete property
  const deleteProp = () => {
    updateColumn(property.id, { isDeleted: true });
    closePopover();
  };
  // 8. Wrap in view
  const wrapProp = () =>
    updateColumn(property.id, { wrapped: !property.wrapped });

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
          Icon={<Icon.Options className="mr-1 h-full w-4 fill-inherit" />}
          Body="Edit property"
        />
      </MenuGroup>
      <Separator />
      <MenuGroup>
        {property.type !== "title" && (
          <MenuItem
            onClick={hideProp}
            Icon={<Icon.EyeHideInversePadded className="size-6 fill-icon" />}
            Body="Hide in view"
          />
        )}
        <MenuItem
          disabled={!canFreeze}
          onClick={pinColumns}
          {...(canUnfreeze
            ? {
                Icon: (
                  <Icon.PinStrikeThrough className="mx-1.5 h-full w-3 fill-icon" />
                ),
                Body: "Unfreeze columns",
              }
            : {
                Icon: <Icon.Pin className="mx-1.5 h-full w-3 fill-icon" />,
                Body: "Freeze up to column",
              })}
        />
        {property.type !== "title" && (
          <>
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
          </>
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem onClick={wrapProp} Body="Wrap column">
          <MenuItemAction className="flex items-center">
            <Switch size="sm" checked={property.wrapped} />
          </MenuItemAction>
        </MenuItem>
      </MenuGroup>
    </>
  );
};
