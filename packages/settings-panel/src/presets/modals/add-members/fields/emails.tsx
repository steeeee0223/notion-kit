import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
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

import { Avatar } from "@/presets/_components";

import { emailSchema, type AddMembersSchema } from "./types";

type DetailedAccount = User & { invited?: boolean; creatable?: boolean };

interface GroupOption {
  label: string;
  items: DetailedAccount[];
}

interface EmailsFieldProps {
  invitedMembers: User[];
}

export function EmailsField({ invitedMembers }: EmailsFieldProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const { control, setValue } = useFormContext<AddMembersSchema>();
  const [inputValue, emails] = useWatch({
    control,
    name: ["_emailInput", "emails"],
  });

  const multiSelectOptions = useMemo<GroupOption[]>(() => {
    const accounts = invitedMembers.map<DetailedAccount>((account) => ({
      ...account,
      invited: true,
    }));
    const normalizedSearch = inputValue.trim();
    const isSearchEmail = emailSchema.safeParse(normalizedSearch).success;
    const creatableEmail =
      isSearchEmail && !emails.some((email) => email === normalizedSearch);
    const hasExactAccount = accounts.some(
      (account) => account.email === normalizedSearch,
    );
    const typedAccount =
      normalizedSearch.length > 0 && !hasExactAccount
        ? [
            {
              id: normalizedSearch,
              email: normalizedSearch,
              name: normalizedSearch,
              avatarUrl: "",
              creatable: creatableEmail,
            },
          ]
        : [];

    return [
      {
        label: isSearchEmail ? t("headings.select") : t("headings.type"),
        items: [...typedAccount, ...accounts],
      },
    ];
  }, [emails, inputValue, invitedMembers, t]);

  return (
    <FormField
      control={control}
      name="emails"
      render={({ field }) => (
        <FormItem>
          <FormControl
            render={
              <Combobox<DetailedAccount, true>
                multiple
                value={field.value.map((email) => ({
                  id: email,
                  email,
                  name: email,
                  avatarUrl: "",
                }))}
                inputValue={inputValue}
                onInputValueChange={(value) => setValue("_emailInput", value)}
                onValueChange={(values) => {
                  field.onChange(values.map((v) => v.email));
                  setValue("_emailInput", "");
                }}
                items={multiSelectOptions}
                itemToStringLabel={(option) => option.name}
                itemToStringValue={(option) => option.email}
                isItemEqualToValue={(item, value) => item.email === value.email}
              >
                <ComboboxChips hideClearButton className="w-full py-1 pl-2">
                  <ComboboxValue>
                    {(selectedValue: DetailedAccount[]) => (
                      <>
                        {selectedValue.map((account) => (
                          <ComboboxChip key={account.email}>
                            {account.email}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          type="email"
                          placeholder={
                            selectedValue.length === 0
                              ? t("search-placeholder")
                              : ""
                          }
                          autoComplete="off"
                        />
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
                  <ComboboxList>
                    {(group: GroupOption) => (
                      <ComboboxGroup key={group.label} items={group.items}>
                        <ComboboxLabel title={group.label} />
                        <ComboboxCollection>
                          {(user: DetailedAccount) => (
                            <ComboboxItem
                              key={user.id}
                              value={user.email}
                              disabled={
                                user.invited === true || !user.creatable
                              }
                              label={user.invited ? user.name : user.email}
                              icon={
                                user.invited ? (
                                  <Avatar
                                    src={user.avatarUrl}
                                    fallback={user.name}
                                  />
                                ) : user.creatable ? (
                                  <Avatar fallback={user.email} />
                                ) : (
                                  <Icon.Envelope />
                                )
                              }
                            >
                              {user.invited && (
                                <MenuItemAction>
                                  <Badge
                                    variant="gray"
                                    size="sm"
                                    className="ml-auto tracking-wide uppercase"
                                  >
                                    {t("invited-badge")}
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
