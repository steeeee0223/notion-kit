import { useMemo } from "react";

import type { User } from "@notion-kit/schemas";
import { useTranslation } from "@notion-kit/ui/i18n";
import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import { Icon } from "@notion-kit/ui/icons";
import {
  Badge,
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  MenuItem,
  MenuItemAction,
  MultiSelect,
  MultiSelectOption,
  SelectPreset,
  Spinner,
} from "@notion-kit/ui/primitives";
import { idToColor } from "@notion-kit/utils";

import type { TeamspaceRole } from "@/lib/types";
import { Avatar } from "@/presets/_components";

import { useAddTeamMembersForm } from "./use-add-team-members-form";

interface WorkspaceMember extends User {
  invited?: boolean;
}

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

  const multiSelectOptions = useMemo(
    () =>
      workspaceMembers.map<MultiSelectOption>((user) => ({
        label: user.name,
        value: user.name,
        id: user.id,
        disabled: user.invited,
        avatarUrl: user.avatarUrl,
        header: t("headings.select"),
      })),
    [workspaceMembers, t],
  );

  const { form, members, submit } = useAddTeamMembersForm({
    workspaceMembers,
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
            <FormField
              control={form.control}
              name="users"
              render={({ field }) => (
                <FormItem className="min-w-0 grow">
                  <FormControl>
                    <MultiSelect
                      groupBy="header"
                      className="min-h-7 border-none bg-transparent py-1.5 pl-2 focus-within:shadow-none!"
                      classNames={{ input: "p-0" }}
                      options={multiSelectOptions}
                      disabled={field.disabled}
                      placeholder={t("search-placeholder")}
                      hideClearAllButton
                      emptyIndicator={t("no-results")}
                      value={field.value.map((user) => ({
                        label: user.name,
                        value: user.name,
                        id: user.id,
                        color: idToColor(user.id),
                      }))}
                      onChange={(values) =>
                        field.onChange(
                          values.reduce<User[]>((acc, v) => {
                            const member = members.get(v.value);
                            if (member) acc.push(member);
                            return acc;
                          }, []),
                        )
                      }
                      renderOption={({ option }) => (
                        <MenuItem
                          Icon={
                            <Avatar
                              src={
                                "avatarUrl" in option
                                  ? (option.avatarUrl as string)
                                  : undefined
                              }
                              fallback={option.label}
                            />
                          }
                          Body={option.label}
                        >
                          {option.disabled && (
                            <MenuItemAction>
                              <Badge
                                variant="gray"
                                size="sm"
                                className="ml-auto tracking-wide uppercase"
                              >
                                {t("invited")}
                              </Badge>
                            </MenuItemAction>
                          )}
                        </MenuItem>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="sticky top-0 ml-2 shrink-0 py-0.5">
                  <FormControl>
                    <SelectPreset
                      options={{
                        owner: t("roles.owner"),
                        member: t("roles.member"),
                      }}
                      className="mb-0 w-[170px] text-muted"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
