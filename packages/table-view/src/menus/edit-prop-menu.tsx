"use client";

import { Icon } from "@notion-kit/icons";
import {
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuItemSelect,
  Separator,
  Switch,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader, PropMeta } from "../common";
import { TableViewMenuPage } from "../features";
import { useTableViewCtx } from "../table-contexts";

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
  const { table } = useTableViewCtx();

  const info = table.getColumnInfo(propId);
  const plugin = table.getColumnPlugin(propId);

  // 1. Type selection
  const openTypesMenu = () =>
    table.setTableMenuState({
      open: true,
      page: TableViewMenuPage.ChangePropType,
      id: propId,
    });
  // 3. Wrap in view
  const wrapProp = () => table.toggleColumnWrapped(propId, (v) => !v);
  // 4. Hide in view
  const hideProp = () => table.setColumnInfo(propId, { hidden: true });
  // 5. Duplicate property
  const duplicateProp = () => table.duplicateColumnInfo(propId);
  // 6. Delete property
  const deleteProp = () => table.setColumnInfo(propId, { isDeleted: true });

  return (
    <>
      <MenuHeader
        title="Edit property"
        onBack={() =>
          table.setTableMenuState({ open: true, page: TableViewMenuPage.Props })
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
              data-disabled
              icon={<Icon.ArrowSquarePathUpDown />}
              label="Type"
            >
              <MenuItemSelect>
                <div className="flex items-center truncate">
                  <Icon.LockedFilled className="h-full w-3.5 fill-icon" />
                  <div className="inline-block min-h-1 min-w-1" />
                  <span>Title</span>
                </div>
              </MenuItemSelect>
            </MenuItem>
          </TooltipPreset>
        ) : (
          <>
            <MenuItem
              onClick={openTypesMenu}
              icon={<Icon.ArrowSquarePathUpDown />}
              label="Type"
            >
              <MenuItemSelect>
                <div className="flex truncate">
                  <DefaultIcon type={info.type} className="fill-current" />
                  <div className="inline-block min-h-1 min-w-1" />
                  <span>{plugin.meta.name}</span>
                </div>
              </MenuItemSelect>
            </MenuItem>
            <MenuItem
              // TODO
              data-disabled
              icon={<Icon.PencilLine />}
              label={
                <div className="flex items-center">
                  AI Autofill
                  <div className="ml-1.5 inline-block w-fit self-center rounded-sm bg-blue/10 px-1 py-0.5 text-[11px]/[1.3] font-medium tracking-normal whitespace-nowrap text-blue">
                    New
                  </div>
                </div>
              }
            >
              <MenuItemSelect>
                <div className="flex truncate">Off</div>
              </MenuItemSelect>
            </MenuItem>
          </>
        )}
      </MenuGroup>
      <Separator />
      <MenuGroup>
        <MenuItem
          onClick={wrapProp}
          icon={<Icon.ArrowUTurnDownLeft />}
          label="Wrap in view"
        >
          <MenuItemAction className="flex items-center">
            <Switch size="sm" checked={info.wrapped} />
          </MenuItemAction>
        </MenuItem>
        {info.type !== "title" && (
          <>
            <MenuItem
              onClick={hideProp}
              icon={<Icon.EyeHideInversePadded className="size-6" />}
              label="Hide in view"
            />
            <MenuItem
              onClick={duplicateProp}
              icon={<Icon.Duplicate />}
              label="Duplicate property"
            />
            <MenuItem
              variant="warning"
              onClick={deleteProp}
              icon={<Icon.Trash />}
              label="Delete property"
            />
          </>
        )}
      </MenuGroup>
    </>
  );
}
