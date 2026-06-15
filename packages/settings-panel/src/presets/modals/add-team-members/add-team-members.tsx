import { useMemo } from "react";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import type { User } from "@notion-kit/schemas";
import { IconBlock, type IconData } from "@notion-kit/ui/icon-block";
import {
  Badge,
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  MenuItemAction,
  SelectPreset,
  Spinner,
} from "@notion-kit/ui/primitives";
import { idToColor } from "@notion-kit/utils";

import type { TeamspaceRole } from "@/lib/types";
import { Avatar } from "@/presets/_components";

import { useAddTeamMembersForm } from "./use-add-team-members-form";

interface AddTeamMembersOption {
  id: string;
  name: string;
  color: string;
  disabled?: boolean;
  avatarUrl: string;
}

interface GroupOption {
  label: string;
  items: AddTeamMembersOption[];
}

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
    () => [
      {
        label: t("headings.select"),
        items: workspaceMembers.map<AddTeamMembersOption>((user) => ({
          id: user.id,
          name: user.name,
          color: idToColor(user.id),
          disabled: user.invited,
          avatarUrl: user.avatarUrl,
        })),
      },
    ],
    [t, workspaceMembers],
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
                <FormItem className="min-w-0 flex-1 basis-0">
                  <FormControl
                    render={
                      <Combobox<AddTeamMembersOption, true>
                        multiple
                        disabled={field.disabled}
                        value={field.value.map((user) => ({
                          id: user.id,
                          name: user.name,
                          color: idToColor(user.id),
                          avatarUrl: user.avatarUrl,
                        }))}
                        onValueChange={(values) => {
                          field.onChange(
                            values.reduce<User[]>((acc, option) => {
                              const member = members.get(option.name);
                              if (member) acc.push(member);
                              return acc;
                            }, []),
                          );
                        }}
                        items={multiSelectOptions}
                        itemToStringLabel={(option) => option.name}
                        itemToStringValue={(option) => option.name}
                        isItemEqualToValue={(item, value) =>
                          item.name === value.name
                        }
                      >
                        <ComboboxChips
                          hideClearButton
                          className="min-h-7 cursor-text border-none bg-transparent py-1.5 pl-2 focus-within:shadow-none!"
                        >
                          <ComboboxValue>
                            {(selected: AddTeamMembersOption[]) => (
                              <>
                                {selected.map((option) => (
                                  <ComboboxChip
                                    key={option.id}
                                    style={{ backgroundColor: option.color }}
                                  >
                                    {option.name}
                                  </ComboboxChip>
                                ))}
                                <ComboboxChipsInput
                                  placeholder={t("search-placeholder")}
                                />
                              </>
                            )}
                          </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent>
                          <ComboboxEmpty>{t("no-results")}</ComboboxEmpty>
                          <ComboboxList>
                            {(group: GroupOption) => (
                              <ComboboxGroup
                                key={group.label}
                                items={group.items}
                              >
                                <ComboboxLabel title={group.label} />
                                <ComboboxCollection>
                                  {(option: AddTeamMembersOption) => (
                                    <ComboboxItem
                                      key={option.id}
                                      value={option}
                                      disabled={option.disabled}
                                      label={option.name}
                                      icon={
                                        <Avatar
                                          src={option.avatarUrl}
                                          fallback={option.name}
                                        />
                                      }
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
                                    </ComboboxItem>
                                  )}
                                </ComboboxCollection>
                              </ComboboxGroup>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    }
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="sticky top-0 ml-2 w-auto shrink-0 py-0.5">
                  <FormControl
                    render={
                      <SelectPreset
                        options={{
                          owner: t("roles.owner"),
                          member: t("roles.member"),
                        }}
                        className="mb-0 w-[170px] text-muted"
                        {...field}
                      />
                    }
                  />
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
