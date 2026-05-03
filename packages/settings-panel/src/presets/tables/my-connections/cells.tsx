import { useTranslation } from "@notion-kit/ui/i18n";
import { Icon } from "@notion-kit/ui/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@notion-kit/ui/primitives";

import { Avatar } from "@/presets/_components";

import { connectionCardData } from "../../connections";

interface ConnectionCellProps {
  type: string;
  account: string;
}

export function ConnectionCell({ type, account }: ConnectionCellProps) {
  const connection = connectionCardData.find(({ id }) => id === type);

  if (!connection) return null;
  return (
    <div className="flex items-center">
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
  const { t } = useTranslation("settings", { keyPrefix: "tables.connections" });
  const trans = t("actions", { returnObjects: true });

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
            Body={trans.connect}
            onSelect={onCreateConnection}
          />
          <DropdownMenuItem
            variant="error"
            Body={trans.disconnect}
            onSelect={onDisconnect}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
