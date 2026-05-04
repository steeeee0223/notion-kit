import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import {
  Button,
  Dialog,
  DialogTrigger,
  MenuItemAction,
  Separator,
} from "@notion-kit/ui/primitives";

import type { TeamspacePermission as Permission } from "@/lib/types";
import {
  HintButton,
  permissions,
  TeamspacePermission,
} from "@/presets/_components";

import { LeaveTeamspace } from "../leave-teamspace";
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
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.teamspace-detail.general",
  });
  const options = { ...permissions };
  options.default.description = permissions.default.getDescription(workspace);

  return (
    <div className="space-y-5">
      <section>
        <Title title={t("details-title")} />
        <Card className="flex flex-col">
          <div className="py-2">
            <div className="truncate text-xs text-secondary">
              {t("icon-name")}
            </div>
            <div className="flex items-center gap-2">
              <IconBlock icon={teamspace.icon} />
              <div className="truncate text-sm text-primary">
                {teamspace.name}
              </div>
            </div>
          </div>
          <Separator />
          <div className="py-2">
            <div className="truncate text-xs text-secondary">
              {t("description")}
            </div>
            {teamspace.description ? (
              <div className="truncate text-sm text-primary">
                {teamspace.description}
              </div>
            ) : (
              <div className="text-sm text-secondary">
                {t("no-description")}
              </div>
            )}
          </div>
        </Card>
      </section>
      <section>
        <Title title={t("permissions-title")} />
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
              <Icon.Chevron side="right" className="size-3 fill-default/30" />
            </MenuItemAction>
          </TeamspacePermission>
        </Card>
      </section>
      <section>
        <Title title={t("danger-zone-title")} />
        <Card className="mb-2.5 flex flex-col hover:bg-red/10">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                tabIndex={-1}
                variant={null}
                className="h-11 w-full min-w-0 shrink-0 justify-normal gap-3.5 py-2 text-sm/tight text-red hover:bg-transparent"
              >
                <Icon.ArrowLineRight className="size-5 fill-current" />
                <div className="flex flex-col items-start">
                  <div className="truncate text-sm/5 text-red">
                    {t("leave")}
                  </div>
                  <div className="overflow-hidden text-xs text-ellipsis whitespace-normal text-secondary">
                    {t("leave-description")}
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <LeaveTeamspace name={teamspace.name} onLeave={onLeave} />
          </Dialog>
        </Card>
        <HintButton
          icon="help"
          label={t("learn-more")}
          href="https://www.notion.com/help/guides/teamspaces-give-teams-home-for-important-work"
        />
      </section>
    </div>
  );
}
