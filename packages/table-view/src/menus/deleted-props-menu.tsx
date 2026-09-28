import { Icon } from "@notion-kit/icons";
import { TableViewMenuPage } from "@notion-kit/table-hook";
import type { ColumnInfo } from "@notion-kit/table-hook";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  DropdownMenuGroup,
  DropdownMenuItem,
  MenuItemAction,
} from "@notion-kit/ui/primitives";

import { DefaultIcon, MenuHeader } from "@/common";
import { useTableViewMessages } from "@/messages";
import { useTableViewCtx } from "@/table-contexts";

export function DeletedPropsMenu() {
  const { table } = useTableViewCtx();
  const messages = useTableViewMessages();

  return (
    <>
      <MenuHeader
        title={messages.deletedPropsMenu.title}
        onBack={() =>
          table.setTableMenuState({ open: true, page: TableViewMenuPage.Props })
        }
      />
      <DropdownMenuGroup>
        {table.getDeletedColumns().map((info) => (
          <PropertyItem
            key={info.id}
            info={info}
            onRestore={() => table.setColumnInfo(info.id, { isDeleted: false })}
            onDelete={() => table.removeColumnInfo(info.id)}
          />
        ))}
      </DropdownMenuGroup>
    </>
  );
}

interface PropertyItemProps {
  info: ColumnInfo;
  onRestore: () => void;
  onDelete: () => void;
}

function PropertyItem({ info, onRestore, onDelete }: PropertyItemProps) {
  const messages = useTableViewMessages();
  return (
    <DropdownMenuItem
      label={info.name}
      icon={
        info.icon ? (
          <IconBlock icon={info.icon} />
        ) : (
          <DefaultIcon type={info.type} />
        )
      }
      closeOnClick={false}
    >
      <MenuItemAction className="flex items-center text-muted">
        <Button
          tabIndex={0}
          aria-label={messages.deletedPropsMenu.restoreProperty(info.name)}
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
          aria-label={messages.deletedPropsMenu.deleteProperty(info.name)}
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
    </DropdownMenuItem>
  );
}
