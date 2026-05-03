import { useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/ui/i18n";
import { IconBlock } from "@notion-kit/ui/icon-block";
import { Icon } from "@notion-kit/ui/icons";
import { Role } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SelectPreset as Select,
  type SelectPresetProps,
} from "@notion-kit/ui/primitives";

import { Scope } from "@/lib/types";
import type { GuestRow, MemberRow, PartialRole } from "@/lib/types";
import { DeleteGuest, DeleteMember } from "@/presets/modals";

interface TeamspacesCellProps {
  teamspaces: MemberRow["teamspaces"];
  onTeamspaceSelect?: (id: string) => void;
}
export const TeamspacesCell = ({
  teamspaces,
  onTeamspaceSelect,
}: TeamspacesCellProps) => {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.cells",
  });

  return (
    <div className="flex items-center">
      {teamspaces.length < 1 ? (
        <div className="w-auto cursor-default p-2 text-sm text-muted">
          {t("no-access")}
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="hint" size="xs">
              <span className="text-primary">
                {t("teamspaces", { count: teamspaces.length })}
              </span>
              <Icon.ChevronDown className="size-2.5 fill-icon" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {teamspaces.map((ts) => (
                <DropdownMenuItem
                  key={ts.id}
                  onClick={() => onTeamspaceSelect?.(ts.id)}
                  Icon={<IconBlock icon={ts.icon} size="sm" />}
                  Body={
                    <div className="flex items-center">
                      <div className="max-w-full shrink-0 truncate">
                        <div className="max-w-25 truncate text-sm leading-5 text-primary">
                          {ts.name}
                        </div>
                      </div>
                      <div className="inline-flex truncate text-xs text-muted">
                        <span className="mx-2">—</span>
                        {t("members", { count: ts.memberCount })}
                      </div>
                    </div>
                  }
                />
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

interface RoleCellProps {
  className?: string;
  role: Role;
}

export function RoleCell({ className, role }: RoleCellProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.roles",
  });

  return (
    <div
      className={cn("w-auto cursor-default text-sm text-secondary", className)}
    >
      {t(role)}
    </div>
  );
}

interface RoleSelectCellProps {
  role: PartialRole;
  scopes?: Set<Scope>;
  onSelect?: (role: PartialRole) => void | Promise<void>;
}
export function RoleSelectCell({
  role,
  scopes,
  onSelect,
}: RoleSelectCellProps) {
  const { t } = useTranslation("settings", { keyPrefix: "tables.people" });
  const roleOptions = t("role-options", { returnObjects: true });

  const [isUpdating, startTransition] = useTransition();
  const select = (role: PartialRole) =>
    startTransition(async () => await onSelect?.(role));

  return (
    <div className="flex items-center">
      {scopes?.has(Scope.MemberUpdate) ? (
        <Select
          className="w-auto"
          options={roleOptions}
          onChange={select}
          value={role}
          align="center"
          renderOption={Custom}
          disabled={isUpdating}
        />
      ) : (
        <RoleCell role={role} />
      )}
    </div>
  );
}

const Custom: SelectPresetProps["renderOption"] = ({ option }) => (
  <div className="min-w-0 truncate text-secondary">
    {typeof option === "string" ? option : option?.label}
  </div>
);

interface MemberActionCellProps {
  isSelf: boolean;
  onDelete?: () => void | Promise<void>;
}

export function MemberActionCell({ isSelf, onDelete }: MemberActionCellProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.actions",
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="hint" className="size-5" aria-label="More options">
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Bye className="size-4" />}
                Body={
                  isSelf ? t("leave-workspace") : t("remove-from-workspace")
                }
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <DeleteMember onDelete={onDelete} />
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AccessCellProps {
  access: GuestRow["access"];
}
export function AccessCell({ access }: AccessCellProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.cells",
  });

  const options = access.reduce<SelectPresetProps["options"]>(
    (acc, { id, name, scope }) => ({
      ...acc,
      [id]: { label: name, description: scope },
    }),
    {},
  );

  return (
    <div className="flex items-center">
      {access.length < 1 ? (
        <div className="min-w-30 cursor-default pl-2 text-sm text-muted">
          {t("no-access")}
        </div>
      ) : (
        <Select
          className="w-auto"
          options={options}
          hideCheck
          align="center"
          placeholder={t("pages", { count: access.length })}
          renderOption={() => <AccessCellDisplay pages={access.length} />}
        />
      )}
    </div>
  );
}

const AccessCellDisplay = ({ pages }: { pages: number }) => {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.cells",
  });
  return (
    <div className="min-w-0 truncate text-secondary">
      {t("pages", { count: pages })}
    </div>
  );
};

interface GuestActionCellProps {
  name: string;
  onUpdate?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function GuestActionCell({
  name,
  onUpdate,
  onDelete,
}: GuestActionCellProps) {
  const { t } = useTranslation("settings", { keyPrefix: "tables.people" });
  const trans = t("actions", { returnObjects: true });

  const [isUpgrading, startTransition] = useTransition();
  const upgrade = () => startTransition(async () => await onUpdate?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="size-5"
          disabled={isUpgrading}
          aria-label="More options"
        >
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            Icon={<Icon.ArrowUpCircled className="size-4" />}
            Body={trans["upgrade-to-member"]}
            onSelect={upgrade}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem
                variant="error"
                Icon={<Icon.Bye className="size-4" />}
                Body={trans["remove-from-workspace"]}
                onSelect={(e) => e.preventDefault()}
              />
            </DialogTrigger>
            <DeleteGuest name={name} onDelete={onDelete} />
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface InvitationActionCellProps {
  onCancel?: () => void | Promise<void>;
}

export function InvitationActionCell({ onCancel }: InvitationActionCellProps) {
  const { t } = useTranslation("settings", { keyPrefix: "tables.people" });
  const trans = t("actions", { returnObjects: true });

  const [isCancelling, startTransition] = useTransition();
  const cancel = () => startTransition(async () => await onCancel?.());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="hint"
          className="size-5"
          disabled={isCancelling}
          aria-label="More options"
        >
          <Icon.Dots className="size-4 fill-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            Icon={<Icon.Bye className="size-4" />}
            Body={trans["cancel-invitation"]}
            onSelect={cancel}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
