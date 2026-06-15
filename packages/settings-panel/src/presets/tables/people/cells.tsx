import { useState, useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Role } from "@notion-kit/schemas";
import { IconBlock } from "@notion-kit/ui/icon-block";
import {
  Button,
  Dialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
          <DropdownMenuTrigger
            render={
              <Button variant="hint" size="xs">
                <span className="text-primary">
                  {t("teamspaces", { count: teamspaces.length })}
                </span>
                <Icon.Chevron side="down" className="size-2.5 fill-icon" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              {teamspaces.map((ts) => (
                <DropdownMenuItem
                  key={ts.id}
                  onClick={() => onTeamspaceSelect?.(ts.id)}
                  icon={<IconBlock icon={ts.icon} size="sm" />}
                  label={ts.name}
                  desc={t("members", { count: ts.memberCount })}
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
  const options = Object.entries(roleOptions).map(([value, option]) => ({
    value,
    label: option.label,
    desc: option.description,
  }));

  const [isUpdating, startTransition] = useTransition();
  const select = (role: PartialRole) =>
    startTransition(async () => await onSelect?.(role));

  return (
    <div className="flex items-center">
      {scopes?.has(Scope.MemberUpdate) ? (
        <Select
          items={options}
          value={role}
          onValueChange={(value) => {
            if (value !== null) select(value);
          }}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-auto">
            <SelectValue>
              {(value: PartialRole) => (
                <div className="min-w-0 truncate text-secondary">
                  {roleOptions[value].label}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} {...option} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <RoleCell role={role} />
      )}
    </div>
  );
}

interface MemberActionCellProps {
  isSelf: boolean;
  onDelete?: () => void | Promise<void>;
}

export function MemberActionCell({ isSelf, onDelete }: MemberActionCellProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "tables.people.actions",
  });
  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="hint" className="size-5" aria-label="More options">
            <Icon.Dots className="size-4 fill-current" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            icon={<Icon.Bye className="size-4" />}
            label={isSelf ? t("leave-workspace") : t("remove-from-workspace")}
            closeOnClick={false}
            onClick={() => setOpenRemoveConfirm(true)}
          />
          <Dialog open={openRemoveConfirm} onOpenChange={setOpenRemoveConfirm}>
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

  return (
    <div className="flex items-center">
      {access.length < 1 ? (
        <div className="min-w-30 cursor-default pl-2 text-sm text-muted">
          {t("no-access")}
        </div>
      ) : (
        <Select items={[{ items: access }]}>
          <SelectTrigger>
            <SelectValue>
              <AccessCellDisplay pages={access.length} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="center">
            <SelectGroup>
              {access.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  label={option.name}
                  desc={option.scope}
                  hideCheck
                />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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

  const [openRemoveConfirm, setOpenRemoveConfirm] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="hint"
            className="size-5"
            disabled={isUpgrading}
            aria-label="More options"
          >
            <Icon.Dots className="size-4 fill-current" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            icon={<Icon.ArrowUpCircled className="size-4" />}
            label={trans["upgrade-to-member"]}
            onClick={upgrade}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            icon={<Icon.Bye className="size-4" />}
            label={trans["remove-from-workspace"]}
            closeOnClick={false}
            onClick={() => setOpenRemoveConfirm(true)}
          />
          <Dialog open={openRemoveConfirm} onOpenChange={setOpenRemoveConfirm}>
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
      <DropdownMenuTrigger
        render={
          <Button
            variant="hint"
            className="size-5"
            disabled={isCancelling}
            aria-label="More options"
          >
            <Icon.Dots className="size-4 fill-current" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="error"
            icon={<Icon.Bye className="size-4" />}
            label={trans["cancel-invitation"]}
            onClick={cancel}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
