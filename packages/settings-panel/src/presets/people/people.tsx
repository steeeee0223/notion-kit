"use client";

import { useCallback, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { ChevronDown } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { BaseModal } from "@notion-kit/common";
import { useCopyToClipboard, useTransition } from "@notion-kit/hooks";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Plan, Role } from "@notion-kit/schemas";
import {
  Button,
  Input,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { generateGuestsCsv, Scope } from "../../lib";
import { AddMembers, DeleteGuest, DeleteMember } from "../modals";
import { GroupsTable, GuestsTable, MembersTable } from "../tables";
import { usePeople } from "./use-people";

export function People() {
  const {
    scopes,
    settings: { account, workspace },
    people,
    workspace: actions,
  } = useSettings();
  /** i18n */
  const { t } = useTranslation("settings");
  const common = t("common", { returnObjects: true });
  const { title, invite, tabs, upgrade, modals } = t("people", {
    returnObjects: true,
  });
  /** Search Field */
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const toggleSearch = () => {
    setOpen((prev) => !prev);
    inputRef.current?.focus();
  };
  useOnClickOutside(searchRef as React.RefObject<HTMLElement>, () =>
    setOpen(false),
  );
  /** Modals */
  const { openModal } = useModal();
  /** Tables */
  const { members, guests } = usePeople();
  const updateMember = useCallback(
    async (id: string, role: Role) => {
      await people?.update?.(id, role);
      if (id === account.id) await actions?.update?.({ role });
    },
    [account.id, actions, people],
  );
  const deleteMember = (id: string) =>
    openModal(<DeleteMember onDelete={() => people?.delete?.(id)} />);
  const deleteGuest = (id: string, name: string) =>
    openModal(
      <DeleteGuest name={name} onDelete={() => people?.delete?.(id)} />,
    );
  /** Handlers */
  const [, copy] = useCopyToClipboard();
  const copyLink = async () => {
    await copy(workspace.inviteLink);
    toast.success("Copied link to clipboard");
  };
  const [updateLink, isUpdating] = useTransition(() => actions?.resetLink?.());
  const resetLink = () =>
    openModal(
      <BaseModal
        {...modals["reset-link"]}
        onTrigger={() => void updateLink()}
      />,
    );
  const addMembers = () =>
    openModal(
      <AddMembers
        invitedMembers={[
          ...members.map(({ user }) => user),
          ...guests.map(({ user }) => user),
        ]}
        onAdd={people?.add}
      />,
    );
  const downloadCsv = useCallback(() => {
    const csv = generateGuestsCsv(guests);
    saveAs(csv, "guests.csv");
  }, [guests]);
  const onGroupsLearnMore = () =>
    window.open(
      "https://www.notion.so/help/add-members-admins-guests-and-groups",
    );

  return (
    <SettingsSection title={title}>
      {scopes.has(Scope.MemberInvite) && (
        <>
          <SettingsRule
            title={invite.title}
            description={
              <TextLinks
                i18nKey="people.invite.description"
                values={{ guests: guests.length }}
                onClick={resetLink}
              />
            }
          >
            <div className="flex items-center gap-4">
              <Button
                variant="soft-blue"
                size="sm"
                className="h-7"
                disabled={isUpdating}
                onClick={copyLink}
              >
                {invite.button}
              </Button>
              <Switch disabled size="sm" />
            </div>
          </SettingsRule>
          <Separator className="my-4" />
        </>
      )}
      <Tabs defaultValue="members" className="relative mt-1 w-full">
        <TabsList className="gap-3 overflow-y-auto p-0">
          <div className="flex grow">
            <TabsTrigger value="members">
              {tabs.members}{" "}
              <span className="text-muted">{members.length}</span>
            </TabsTrigger>
            <TabsTrigger value="guests">
              {tabs.guests} <span className="text-muted">{guests.length}</span>
            </TabsTrigger>
            <TabsTrigger value="groups">{tabs.groups}</TabsTrigger>
          </div>
          <div ref={searchRef} className="flex items-center justify-end gap-1">
            <div className="flex items-center">
              <Button variant="hint" className="size-7" onClick={toggleSearch}>
                <Icon.CollectionSearch className="block size-4 shrink-0 fill-[#787774]" />
              </Button>
              <Input
                ref={inputRef}
                clear
                variant="flat"
                className={cn(
                  "transition-[width,opacity] duration-200 ease-in-out",
                  open
                    ? "w-[150px] opacity-100"
                    : "w-0 p-0 opacity-0 [&_input]:hidden",
                )}
                placeholder={tabs.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onCancel={() => setSearch("")}
              />
            </div>
            <TooltipPreset description="Export guests as CSV" side="top">
              <Button variant="hint" className="size-7" onClick={downloadCsv}>
                <Icon.ArrowDownPage className="block size-5 shrink-0 fill-[#787774]" />
              </Button>
            </TooltipPreset>
            <Button
              variant="blue"
              size="sm"
              className="h-7 px-2"
              // TODO Member can send a request to invite member
              disabled={!scopes.has(Scope.MemberAdd)}
              onClick={addMembers}
            >
              {tabs["add-members"]}
              <ChevronDown className="ml-1 size-4" />
            </Button>
          </div>
        </TabsList>
        <TabsContent value="members" className="mt-0 bg-transparent">
          <MembersTable
            accountId={account.id}
            search={search}
            data={members}
            scopes={scopes}
            onUpdate={updateMember}
            onDelete={deleteMember}
          />
        </TabsContent>
        <TabsContent value="guests" className="mt-0 bg-transparent">
          <GuestsTable
            search={search}
            data={guests}
            scopes={scopes}
            onUpdate={updateMember}
            onDelete={deleteGuest}
          />
        </TabsContent>
        <TabsContent value="groups" className="mt-0 bg-transparent">
          {scopes.has(Scope.Upgrade) &&
            (workspace.plan === Plan.FREE ||
              workspace.plan === Plan.EDUCATION) && (
              <>
                <section className="max-w-[300px] text-sm">
                  <Icon.Group className="mb-2 h-auto w-8 flex-shrink-0 fill-default/45" />
                  <header className="font-semibold">{upgrade.title}</header>
                  <p className="mt-1 mb-4 text-secondary">
                    {upgrade.description}
                  </p>
                  <footer className="mb-4 flex flex-wrap gap-x-3 gap-y-2">
                    <Button variant="blue" size="sm">
                      {common.upgrade}
                    </Button>
                    <Button size="sm" onClick={onGroupsLearnMore}>
                      {common.more}
                    </Button>
                  </footer>
                </section>
                <Separator />
              </>
            )}
          <GroupsTable search={search} data={[]} />
        </TabsContent>
      </Tabs>
    </SettingsSection>
  );
}
