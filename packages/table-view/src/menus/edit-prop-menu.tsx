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
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader, PropMeta } from "../common";
import { TableViewMenuPage } from "../lib/utils";
import { useTableActions, useTableViewCtx } from "../table-contexts";
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
export function EditPropMenu({ propId }: EditPropMenuProps) {
  const { table, setTableMenu } = useTableViewCtx();
  const { duplicate } = useTableActions();

  const info = table.getColumnInfo(propId);

  // 1. Type selection
  const openTypesMenu = () =>
    setTableMenu({
      open: true,
      page: TableViewMenuPage.ChangePropType,
      id: propId,
    });
  // 3. Wrap in view
  const wrapProp = () => table.toggleColumnWrapped(propId, (v) => !v);
  // 4. Hide in view
  const hideProp = () => table.setColumnInfo(propId, { hidden: true });
  // 5. Duplicate property
  const duplicateProp = () => duplicate(propId, "col");
  // 6. Delete property
  const deleteProp = () => table.setColumnInfo(propId, { isDeleted: true });

  return (
    <>
      <MenuHeader
        title="Edit property"
        onBack={() =>
          setTableMenu({ open: true, page: TableViewMenuPage.Props })
        }
      />
      <PropMeta propId={propId} type={info.type} />
      <MenuGroup>
        {info.type === "title" ? (
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
                  <DefaultIcon type={info.type} className="fill-current" />
                  <div className="inline-block min-h-1 min-w-1" />
                  <span>{propertyTypes[info.type]!.title}</span>
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
            <Switch size="sm" checked={info.wrapped} />
          </MenuItemAction>
        </MenuItem>
        {info.type !== "title" && (
          <>
            <MenuItem
              onClick={hideProp}
              Icon={<Icon.EyeHideInversePadded className="size-6" />}
              Body="Hide in view"
            />
            <MenuItem
              onClick={duplicateProp}
              Icon={<Icon.Duplicate />}
              Body="Duplicate property"
            />
            <MenuItem
              variant="warning"
              onClick={deleteProp}
              Icon={<Icon.Trash />}
              Body="Delete property"
            />
          </>
        )}
      </MenuGroup>
    </>
  );
}
