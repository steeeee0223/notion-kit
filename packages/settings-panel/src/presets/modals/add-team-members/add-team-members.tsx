import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  Spinner,
} from "@notion-kit/ui/primitives";

import type { TeamspaceRole } from "@/lib/types";

import {
  RoleField,
  useAddTeamMembersForm,
  UsersField,
  type WorkspaceMember,
} from "./fields";

interface AddTeamMembersProps {
  teamspace: {
    name: string;
    icon: IconData;
  };
  workspaceMembers: WorkspaceMember[];
  onAddMembers?: (data: {
    userIds: string[];
    role: TeamspaceRole;
  }) => Promise<void>;
}

export function AddTeamMembers({
  teamspace,
  workspaceMembers,
  onAddMembers,
}: AddTeamMembersProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-team-members",
  });

  const { form, submit } = useAddTeamMembersForm({
    onSubmit: onAddMembers,
  });
  const disabled = !form.formState.isValid || form.formState.isSubmitting;

  return (
    <DialogContent
      hideClose
      className="max-h-1/2 min-h-50 w-125"
      aria-describedby=""
      onCloseAutoFocus={() => form.reset()}
    >
      <DialogHeader className="items-start text-left">
        <DialogTitle typography="h2" className="flex items-center text-start">
          <div className="min-w-1/4">{t("title-prefix")}</div>
          <IconBlock className="mx-1" size="sm" icon={teamspace.icon} />
          <div className="min-w-60 truncate pr-2.5 font-medium">
            {teamspace.name}
          </div>
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={submit} className="flex flex-col justify-between gap-3">
          <div className="flex min-h-8 w-full cursor-text flex-nowrap items-start rounded-sm bg-input p-[4px_9px] text-sm focus-within:shadow-notion">
            <UsersField workspaceMembers={workspaceMembers} />
            <RoleField />
          </div>
          <DialogFooter className="flex-row justify-between">
            <Button type="button" variant="soft-blue" size="sm" disabled>
              <Icon.Link className="size-3.5 fill-current" />
              {t("copy-link")}
            </Button>
            <Button type="submit" variant="blue" size="sm" disabled={disabled}>
              {form.formState.isSubmitting && <Spinner />}
              {t("invite")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
