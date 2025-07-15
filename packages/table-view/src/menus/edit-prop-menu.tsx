"use client";

import React from "react";

import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  Separator,
  Switch,
  TooltipPreset,
  useMenu,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader, PropMeta } from "../common";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { PropsMenu } from "./props-menu";
import { TypesMenu } from "./types-menu";
import { propertyTypes } from "./types-menu-options";

interface EditPropMenuProps {
  propId: string;
}

/**
 * @summary The property editing menu
 *
 * 1. ✅ Type selection
 * 2. 🚧 Type config
 * ---
 * 3. ✅ Wrap in view
 * 4. ✅ Hide in view
 * 5. ✅ Duplicate property
 * 6. ✅ Delete property
 */
export const EditPropMenu: React.FC<EditPropMenuProps> = ({ propId }) => {
  const { properties, isPropertyUnique } = useTableViewCtx();
  const { updateColumn, duplicate } = useTableActions();
  const { openMenu, closeMenu } = useMenu();

  const property = properties[propId]!;

  const openPropsMenu = () => openMenu(<PropsMenu />, { x: -12, y: -12 });

  // 1. Type selection
  const openTypesMenu = () =>
    openMenu(<TypesMenu propId={property.id} />, { x: -12, y: -12 });
  // 3. Wrap in view
  const wrapProp = () =>
    updateColumn(property.id, { wrapped: !property.wrapped });
  // 4. Hide in view
  const hideProp = () => {
    updateColumn(property.id, { hidden: true });
    closeMenu();
  };
  // 5. Duplicate property
  const duplicateProp = () => {
    duplicate(property.id, "col");
    closeMenu();
  };
  // 6. Delete property
  const deleteProp = () => {
    updateColumn(property.id, { isDeleted: true });
    closeMenu();
  };

  return (
    <>
      <MenuHeader title="Edit property" onBack={openPropsMenu} />
      <PropMeta
        property={property}
        validateName={isPropertyUnique}
        onUpdate={(data) => updateColumn(property.id, data)}
      />
      <MenuGroup>
        {property.type === "title" ? (
          <TooltipPreset
            side="left"
            sideOffset={6}
            description="This property's type cannot be changed."
          >
            <MenuItem
              disabled
              Icon={<Icon.ArrowSquarePathUpDown />}
              Body="Type"
            >
              <MenuItemAction className="flex items-center text-muted">
                <div className="flex items-center truncate">
                  <Icon.LockedFilled className="h-full w-3.5 fill-icon" />
                  <div className="inline-block min-h-1 min-w-1" />
                  <span>Title</span>
                </div>
                <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-current" />
              </MenuItemAction>
            </MenuItem>
          </TooltipPreset>
        ) : (
          <>
            <MenuItem
              onClick={openTypesMenu}
              Icon={<Icon.ArrowSquarePathUpDown />}
              Body="Type"
            >
              <MenuItemAction className="flex items-center text-muted">
                <div className="flex truncate">
                  <DefaultIcon type={property.type} className="fill-current" />
                  <div className="inline-block min-h-1 min-w-1" />
                  <span>{propertyTypes[property.type]!.title}</span>
                </div>
                <Icon.ChevronRight className="transition-out h-full w-3 fill-current" />
              </MenuItemAction>
            </MenuItem>
            <MenuItem
              // TODO
              disabled
              Icon={<Icon.PencilLine />}
              Body={
                <div className="flex items-center">
                  AI Autofill
                  <div className="ml-1.5 inline-block w-fit self-center rounded-sm bg-blue/10 px-1 py-0.5 text-[11px]/[1.3] font-medium tracking-normal whitespace-nowrap text-blue">
                    New
                  </div>
                </div>
              }
            >
              <MenuItemAction className="flex items-center text-muted">
                <div className="flex truncate">Off</div>
                <Icon.ChevronRight className="transition-out ml-1.5 h-full w-3 fill-current" />
              </MenuItemAction>
            </MenuItem>
          </>
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          onClick={wrapProp}
          Icon={<Icon.ArrowUTurnDownLeft />}
          Body="Wrap in view"
        >
          <MenuItemAction className="flex items-center">
            <Switch size="sm" checked={property.wrapped} />
          </MenuItemAction>
        </MenuItem>
        {property.type !== "title" && (
          <>
            <MenuItem
              onClick={hideProp}
              Icon={<Icon.EyeHideInversePadded className="size-6" />}
              Body="Hide in view"
            />
            <MenuItem
              onClick={duplicateProp}
              Icon={<Icon.Duplicate className="h-4" />}
              Body="Duplicate property"
            />
            <MenuItem
              variant="warning"
              onClick={deleteProp}
              Icon={<Icon.Trash className="w-4" />}
              Body="Delete property"
            />
          </>
        )}
      </MenuGroup>
    </>
  );
};
