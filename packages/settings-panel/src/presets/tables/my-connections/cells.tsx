import { Icon } from "@notion-kit/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

import { Avatar } from "../../_components";
import { connectionCardData } from "../../connections";

interface ConnectionCellProps {
  type: string;
  account: string;
}

export function ConnectionCell({ type, account }: ConnectionCellProps) {
  const connection = connectionCardData.find(({ id }) => id === type);

  if (!connection) return null;
  return (
    <div className="mr-3 flex items-center">
      <Avatar src={connection.imageUrl} fallback={type} className="size-7" />
      <div className="ml-[15px]">
        <div className="truncate text-sm text-primary">{connection.title}</div>
        <div className="truncate text-xs text-secondary">{account}</div>
      </div>
    </div>
  );
}

interface ActionCellProps {
  onCreateConnection?: () => void;
  onDisconnect?: () => void;
}

export function ActionCell({
  onCreateConnection,
  onDisconnect,
}: ActionCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" aria-label="More options">
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem
            // TODO impl. this
            disabled
            Body="Connect another account"
            onSelect={onCreateConnection}
          />
          <DropdownMenuItem
            variant="error"
            Body="Disconnect account"
            onSelect={onDisconnect}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
