"use client";

import React, { useState } from "react";
import { CircleHelp, Mail } from "lucide-react";
import { z } from "zod/v4";

import { useFilter, useTransition } from "@notion-kit/hooks";
import { useModal } from "@notion-kit/modal";
import { Role, type User } from "@notion-kit/schemas";
import {
  Badge,
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  SelectPreset as Select,
} from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";
import { TagsInput } from "@notion-kit/tags-input";

import { Avatar, HintButton } from "../_components";

enum Heading {
  Select = "Select a person",
  Type = "Keep typing to invite email",
}

const emailSchema = z.email();

type DetailedAccount = User & { invited?: boolean };
interface AddMembersProps {
  invitedMembers: User[];
  onAdd?: (data: { emails: string[]; role: Role }) => void;
}

export const AddMembers: React.FC<AddMembersProps> = ({
  invitedMembers,
  onAdd,
}) => {
  const { isOpen, closeModal } = useModal();

  const [heading, setHeading] = useState(Heading.Select);
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
  const [invite, loading] = useTransition(() => {
    onAdd?.({ emails, role });
    onClose();
  });
  const onInputChange = (input: string) => {
    if (input.length > 0) {
      const result = emailSchema.safeParse(input);
      setHeading(result.success ? Heading.Select : Heading.Type);
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
    closeModal();
    setHeading(Heading.Select);
    updateSearch("");
    setEmails([]);
    setRole(Role.OWNER);
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
      className="flex w-[480px] min-w-[180px] flex-col"
      shouldFilter={false}
    >
      <div className="z-10 max-h-[240px] flex-shrink-0 overflow-hidden overflow-y-auto border-b border-border">
        <div className="flex min-w-0 flex-1 flex-col items-stretch">
          <div className="z-10 mr-0 mb-0 flex min-h-[34px] w-full cursor-text flex-nowrap items-start overflow-auto bg-input/60 p-[4px_9px] text-sm dark:bg-input/5">
            <TagsInput
              role="combobox"
              type="email"
              size={1}
              placeholder="Search name or emails"
              autoComplete="off"
              value={{ tags: emails, input: search }}
              inputSchema={emailSchema}
              onTagsChange={setEmails}
              onInputChange={onInputChange}
              className="min-h-[34px] min-w-0 flex-grow border-none bg-transparent px-0"
            />
            <div className="ml-2 flex flex-shrink-0 items-center gap-2 py-0.5">
              <Select
                value={role}
                onChange={setRole}
                options={{
                  owner: "Workspace Owner",
                  member: "Member",
                  guest: "Guest",
                }}
                className="m-0 w-fit text-muted"
              />
              <Button
                tabIndex={0}
                variant="blue"
                size="sm"
                disabled={emails.length < 1}
                onClick={invite}
                className="h-7 min-w-[70px] font-medium"
              >
                Invite
                {loading && <Spinner className="text-current" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CommandList className="max-h-[300px] min-h-0 flex-grow transform overflow-auto overflow-x-hidden">
        <CommandGroup className="min-h-[200px]">
          <div className="my-1.5 flex fill-current px-2 text-xs leading-5 font-medium text-default/45 select-none">
            <div className="self-center overflow-hidden overflow-ellipsis whitespace-nowrap">
              {heading}
            </div>
          </div>
          <CommandEmpty className="flex min-h-7 items-center px-2 py-0 leading-[1.2] text-secondary select-none">
            <span>Type or paste in emails above, separated by commas.</span>
          </CommandEmpty>
          {filteredAccounts?.map((user) => (
            <Item key={user.id} user={user} onSelect={onTagSelect} />
          ))}
        </CommandGroup>
      </CommandList>
      <CommandSeparator />
      <a
        href="https://www.notion.so/help/add-members-admins-guests-and-groups"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-1 text-inherit no-underline select-none"
      >
        <HintButton
          icon={CircleHelp}
          label="Learn how to invite people and set permissions"
          className="w-full justify-start px-3"
        />
      </a>
    </CommandDialog>
  );
};

interface ItemProps {
  user: DetailedAccount;
  onSelect?: (value: string) => void;
}

const Item: React.FC<ItemProps> = ({
  user: { name, email, avatarUrl, invited },
  onSelect,
}) => {
  return (
    <CommandItem
      className="leading-[1.2]"
      key={email}
      value={email}
      onSelect={onSelect}
      disabled={invited}
    >
      <div className="mr-2.5 flex items-center justify-center">
        {invited ? (
          <Avatar src={avatarUrl} fallback={name} />
        ) : (
          <Mail className="size-5 flex-shrink-0 text-primary" />
        )}
      </div>
      <div className="mr-3 min-w-0 flex-auto truncate">
        {invited ? name : email}
      </div>
      {invited && (
        <Badge
          variant="gray"
          size="sm"
          className="ml-auto tracking-wide uppercase"
        >
          Invited
        </Badge>
      )}
    </CommandItem>
  );
};
