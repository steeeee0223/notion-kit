"use client";

import { CircleHelp } from "lucide-react";

import { useTransition } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button, MenuItemAction, Separator } from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import {
  HintButton,
  permissions,
  TeamspacePermission,
} from "../../_components";
import { TeamspacePermission as Permission } from "../../../lib";
import { Card, Tab, Title } from "./common";

interface GeneralContentProps {
  workspace: string;
  teamspace: {
    name: string;
    icon: IconData;
    description?: string;
    permission: Permission;
  };
  onTabChange: (tab: Tab) => void;
  onLeave?: () => void | Promise<void>;
}

export function GeneralContent({
  workspace,
  teamspace,
  onTabChange,
  onLeave,
}: GeneralContentProps) {
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);

  const [leave, isLeaving] = useTransition(() => onLeave?.());

  return (
    <div className="space-y-5">
      <section>
        <Title title="Details" />
        <Card className="flex flex-col">
          <div className="py-2">
            <div className="truncate text-xs text-secondary">Icon and name</div>
            <div className="flex items-center gap-2">
              <IconBlock icon={teamspace.icon} />
              <div className="truncate text-sm text-primary">
                {teamspace.name}
              </div>
            </div>
          </div>
          <Separator />
          <div className="py-2">
            <div className="truncate text-xs text-secondary">Description</div>
            {teamspace.description ? (
              <div className="truncate text-sm text-primary">
                {teamspace.description}
              </div>
            ) : (
              <div className="text-sm text-secondary">No description</div>
            )}
          </div>
        </Card>
      </section>
      <section>
        <Title title="Permissions" />
        <Card
          role="button"
          tabIndex={-1}
          className="flex flex-col hover:bg-default/5"
          onClick={() => onTabChange(Tab.Members)}
        >
          <TeamspacePermission
            className="mx-0 h-11 px-0 hover:bg-transparent"
            {...options[teamspace.permission]}
          >
            <MenuItemAction>
              <Icon.ChevronRight className="size-3 fill-default/30" />
            </MenuItemAction>
          </TeamspacePermission>
        </Card>
      </section>
      <section>
        <Title title="Danger zone" />
        <Card className="mb-2.5 flex flex-col hover:bg-red/10">
          <Button
            tabIndex={-1}
            variant={null}
            disabled={isLeaving}
            onClick={leave}
            className="h-11 w-full min-w-0 shrink-0 justify-normal gap-3.5 py-2 text-sm/[1.2] text-red hover:bg-transparent"
          >
            {isLeaving ? (
              <Spinner />
            ) : (
              <Icon.ArrowLineRight className="size-5 fill-current" />
            )}
            <div className="flex flex-col items-start">
              <div className="truncate text-sm leading-5 text-red">
                Leave teamspace
              </div>
              <div className="overflow-hidden text-xs text-ellipsis whitespace-normal text-secondary">
                Removes teamspace from your sidebar
              </div>
            </div>
          </Button>
        </Card>
        <HintButton
          icon={CircleHelp}
          label="Learn about teamspaces"
          href="https://www.notion.com/help/guides/teamspaces-give-teams-home-for-important-work"
        />
      </section>
    </div>
  );
}
