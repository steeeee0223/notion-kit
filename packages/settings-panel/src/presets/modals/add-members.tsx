import { useState, useTransition } from "react";
import { z } from "zod/v4";

import { useFilter } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { Role, type User } from "@notion-kit/schemas";
import {
  Badge,
  Button,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
  CommandDialog,
  CommandSeparator,
  SelectPreset as Select,
  Spinner,
} from "@notion-kit/ui/primitives";

import { Avatar, HintButton } from "@/presets/_components";

const emailSchema = z.email();

type DetailedAccount = User & { invited?: boolean };

interface AddMembersProps {
  invitedMembers: User[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdd?: (data: { emails: string[]; role: Role }) => void;
}

export function AddMembers({
  invitedMembers,
  open,
  onOpenChange,
  onAdd,
}: AddMembersProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  const headingSelect = t("headings.select");
  const headingType = t("headings.type");

  const [heading, setHeading] = useState<string>(headingSelect);
  const [role, setRole] = useState<Exclude<Role, Role.ADMIN>>(Role.OWNER);
  /** Input & Filter */
  const [emails, setEmails] = useState<string[]>([]);
  const { search, results, updateSearch } = useFilter(
    invitedMembers,
    ({ name, email }, v) => name.includes(v) || email.includes(v),
    { default: "empty" },
  );
  const filteredAccounts = results
    ? results.map((account) => ({ ...account, invited: true }))
    : search.length > 0
      ? [
          {
            id: search,
            email: search,
            name: search[0]!.toUpperCase(),
            avatarUrl: "",
          },
        ]
      : null;
  /** Actions */
  const [loading, startTransition] = useTransition();
  const invite = () =>
    startTransition(() => {
      onAdd?.({ emails, role });
      onClose();
    });
  const onInputChange = (input: string) => {
    if (input.length > 0) {
      const result = emailSchema.safeParse(input);
      setHeading(result.success ? headingSelect : headingType);
    }
    updateSearch(input);
  };
  const onTagSelect = (value: string) => {
    const result = emailSchema.safeParse(value);
    if (result.success) {
      setEmails((prev) => Array.from(new Set([...prev, value])));
      onInputChange("");
    }
  };
  const onClose = () => {
    onOpenChange?.(false);
    setHeading(headingSelect);
    updateSearch("");
    setEmails([]);
    setRole(Role.OWNER);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onClose}
      className="flex w-[480px] min-w-[180px] flex-col"
      shouldFilter={false}
    >
      <div className="z-10 max-h-60 shrink-0 overflow-hidden overflow-y-auto border-b border-border">
        <div className="flex min-w-0 flex-1 flex-col items-stretch">
          <Combobox<string, true>
            multiple
            open
            value={emails}
            inputValue={search}
            onInputValueChange={onInputChange}
            onValueChange={(values) => {
              const validEmails = values.filter(
                (value) => emailSchema.safeParse(value).success,
              );
              setEmails(Array.from(new Set(validEmails)));
              if (validEmails.length > emails.length) onInputChange("");
            }}
            items={filteredAccounts?.map((user) => user.email) ?? []}
            filter={null}
          >
            <ComboboxChips variant="inline" hideClearButton>
              <div className="flex max-h-16 min-h-[34px] flex-1 flex-wrap gap-1 overflow-auto">
                <ComboboxValue>
                  {(selectedValue: string[]) => (
                    <>
                      {selectedValue.map((email) => (
                        <ComboboxChip key={email}>{email}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        type="email"
                        placeholder={t("search-placeholder")}
                        autoComplete="off"
                      />
                    </>
                  )}
                </ComboboxValue>
              </div>
              <div className="flex shrink-0 items-center gap-2 py-0.5">
                <Select
                  value={role}
                  onChange={setRole}
                  options={t("roles", { returnObjects: true })}
                  className="w-fit text-muted"
                />
                <Button
                  tabIndex={0}
                  variant="blue"
                  size="sm"
                  disabled={emails.length < 1}
                  onClick={invite}
                  className="h-7 min-w-[70px] font-medium"
                >
                  {t("invite")}
                  {loading && <Spinner />}
                </Button>
              </div>
            </ComboboxChips>
            {/* </div> */}
            <ComboboxContent variant="inline">
              <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
              <ComboboxList className="max-h-[300px] min-h-0 grow transform overflow-auto overflow-x-hidden">
                <ComboboxGroup className="min-h-50">
                  <ComboboxLabel title={heading} />
                  {filteredAccounts?.map((user) => (
                    <Item key={user.id} user={user} onSelect={onTagSelect} />
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <CommandSeparator />
      <a
        href="https://www.notion.so/help/add-members-admins-guests-and-groups"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-1 text-inherit no-underline select-none"
      >
        <HintButton
          icon="help"
          label={t("learn-more")}
          className="w-full justify-start px-3"
        />
      </a>
    </CommandDialog>
  );
}

interface ItemProps {
  user: DetailedAccount;
  onSelect?: (value: string) => void;
}

function Item({
  user: { name, email, avatarUrl, invited },
  onSelect,
}: ItemProps) {
  const { t } = useTranslation("settings", {
    keyPrefix: "modals.add-members",
  });

  return (
    <ComboboxItem
      className="leading-tight"
      key={email}
      value={email}
      icon={
        invited ? (
          <Avatar src={avatarUrl} fallback={name} />
        ) : (
          <Icon.Envelope className="size-5 shrink-0 fill-primary" />
        )
      }
      label={invited ? name : email}
      onClick={() => onSelect?.(email)}
      disabled={invited}
    >
      {invited && (
        <Badge
          variant="gray"
          size="sm"
          className="ml-auto tracking-wide uppercase"
        >
          {t("invited-badge")}
        </Badge>
      )}
    </ComboboxItem>
  );
}
