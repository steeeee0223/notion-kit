import { MoreHorizontalIcon } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/shadcn";

import { connectionCardData } from "../../connections";

export const Header = ({ title }: { title: string }) => {
  return <div className="truncate text-xs text-secondary">{title}</div>;
};

interface ConnectionCellProps {
  type: string;
  account: string;
}

export const ConnectionCell = ({ type, account }: ConnectionCellProps) => {
  const connection = connectionCardData.find(({ id }) => id === type);

  if (!connection) return null;
  return (
    <div className="mr-3 flex items-center">
      <img
        src={connection.imageUrl}
        alt={type}
        className="block size-7 shrink-0"
      />
      <div className="ml-[15px]">
        <div className="truncate text-sm text-primary">{connection.title}</div>
        <div className="truncate text-xs text-secondary">{account}</div>
      </div>
    </div>
  );
};

interface ActionCellProps {
  onCreateConnection?: () => void;
  onDisconnect?: () => void;
}

export const ActionCell = ({
  onCreateConnection,
  onDisconnect,
}: ActionCellProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5">
          <MoreHorizontalIcon className="size-5" />
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
};
