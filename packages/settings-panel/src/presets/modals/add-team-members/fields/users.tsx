import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import type { User } from "@notion-kit/schemas";
import {
  Badge,
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
  FormControl,
  FormField,
  FormItem,
  MenuItemAction,
} from "@notion-kit/ui/primitives";
import { idToColor } from "@notion-kit/utils";

import { Avatar } from "@/presets/_components";

import { AddTeamMembersOption, GroupOption, WorkspaceMember } from "./types";
import type { TeamMembersFormSchema } from "./use-add-team-members-form";

interface UsersFieldProps {
  workspaceMembers: WorkspaceMember[];
}

export function UsersField({ workspaceMembers }: UsersFieldProps) {
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
  const members = useMemo(
    () => new Map(workspaceMembers.map((user) => [user.name, user])),
    [workspaceMembers],
  );

  const { control } = useFormContext<TeamMembersFormSchema>();

  return (
    <FormField
      control={control}
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
                isItemEqualToValue={(item, value) => item.name === value.name}
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
                      <ComboboxGroup key={group.label} items={group.items}>
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
  );
}
