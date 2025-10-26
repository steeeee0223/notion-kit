"use client";

import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import {
  Button,
  MenuGroup,
  MenuItem,
  MenuItemAction,
} from "@notion-kit/shadcn";

import { DefaultIcon, MenuHeader } from "../common";
import { TableViewMenuPage } from "../features";
import type { ColumnInfo } from "../lib/types";
import { useTableActions, useTableViewCtx } from "../table-contexts";

export function DeletedPropsMenu() {
  const { table } = useTableViewCtx();
  const { remove } = useTableActions();

  return (
    <>
      <MenuHeader
        title="Deleted properties"
        onBack={() =>
          table.setTableMenuState({ open: true, page: TableViewMenuPage.Props })
        }
      />
      <MenuGroup>
        {table.getDeletedColumns().map((info) => (
          <PropertyItem
            key={info.id}
            info={info}
            onRestore={() => table.setColumnInfo(info.id, { isDeleted: false })}
            onDelete={() => remove(info.id, "col")}
          />
        ))}
      </MenuGroup>
    </>
  );
}

interface PropertyItemProps {
  info: ColumnInfo;
  onRestore: () => void;
  onDelete: () => void;
}

function PropertyItem({ info, onRestore, onDelete }: PropertyItemProps) {
  return (
    <MenuItem
      role="menuitem"
      className="*:data-[slot=menu-item-body]:leading-normal"
      Icon={
        info.icon ? (
          <IconBlock icon={info.icon} />
        ) : (
          <DefaultIcon type={info.type} />
        )
      }
      Body={info.name}
    >
      <MenuItemAction className="flex items-center text-muted">
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
          <Icon.Undo className="size-3.5 fill-current" />
        </Button>
        <Button
          tabIndex={0}
          aria-label="Delete"
          variant="hint"
          className="size-6 disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon.Trash className="fill-current" />
        </Button>
      </MenuItemAction>
    </MenuItem>
  );
}
