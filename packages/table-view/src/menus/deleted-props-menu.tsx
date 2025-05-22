"use client";

import { useMemo } from "react";

import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  MenuGroup,
  MenuItem,
  MenuItemAction,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader } from "../common";
import type { DatabaseProperty } from "../lib/types";
import { useTableActions, useTableViewCtx } from "../table-contexts";
import { useMenuControl } from "./menu-control-context";
import { PropsMenu } from "./props-menu";

export const DeletedPropsMenu = () => {
  const { properties } = useTableViewCtx();
  const { updateColumn, remove } = useTableActions();
  const { openPopover } = useMenuControl();

  const openPropsMenu = () => openPopover(<PropsMenu />, { x: -12, y: -12 });

  const deletedProps = useMemo(
    () => Object.values(properties).filter((prop) => prop.isDeleted),
    [properties],
  );

  return (
    <>
      <MenuHeader title="Deleted properties" onBack={openPropsMenu} />
      <MenuGroup>
        {deletedProps.map((prop) => (
          <PropertyItem
            key={prop.id}
            property={prop}
            onRestore={() => updateColumn(prop.id, { isDeleted: false })}
            onDelete={() => remove(prop.id, "col")}
          />
        ))}
      </MenuGroup>
    </>
  );
};

interface PropertyItemProps {
  property: DatabaseProperty;
  onRestore: () => void;
  onDelete: () => void;
}

const PropertyItem: React.FC<PropertyItemProps> = ({
  property,
  onRestore,
  onDelete,
}) => {
  const { name, icon, type } = property;

  return (
    <MenuItem
      role="menuitem"
      className="*:data-[slot=menu-item-body]:leading-normal"
      Icon={icon ? <IconBlock icon={icon} /> : <DefaultIcon type={type} />}
      Body={name}
    >
      <MenuItemAction className="flex items-center fill-default/35 text-muted">
        <Button
          tabIndex={0}
          aria-label="Restore"
          variant="hint"
          className="size-6 p-0 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            onRestore();
          }}
        >
          <Icon.Undo className="size-3.5 fill-default/45" />
        </Button>
        <Button
          tabIndex={0}
          aria-label="Delete"
          variant="hint"
          className="size-6 p-0 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon.Trash className="size-3.5 fill-default/45" />
        </Button>
      </MenuItemAction>
    </MenuItem>
  );
};
