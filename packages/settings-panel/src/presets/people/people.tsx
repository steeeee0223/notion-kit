"use client";

import { useCallback, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { ChevronDown } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { BaseModal } from "@notion-kit/common";
import { useTranslation } from "@notion-kit/i18n";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import { Plan } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  Input,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { TextLinks } from "../_components";
import { SettingsRule, SettingsSection, useSettings } from "../../core";
import { generateGuestsCsv, GuestRow, MemberRow, Scope } from "../../lib";
import { useInvitations, useTeamspaceDetail } from "../hooks";
import { AddMembers, DeleteGuest, DeleteMember } from "../modals";
import {
  GroupsTable,
  GuestsTable,
  InvitationsTable,
  MembersTable,
} from "../tables";
import { useInvitationsActions } from "./use-invitations-actions";
import { useLinkActions } from "./use-link-actions";
import { useInvitedMembers, useWorkspaceMemberships } from "./use-people";
import { usePeopleActions } from "./use-people-actions";

enum PeopleTabs {
  Members = "members",
  Guests = "guests",
  Groups = "groups",
  Invitations = "invitations",
}

export function People() {
  const {
    scopes,
    settings: { account, workspace },
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
  const { members, guests } = useWorkspaceMemberships();
  const { selectedTeamspace, setSelectedTeamspace, renderTeamspaceDetail } =
    useTeamspaceDetail();
  const { update, remove } = usePeopleActions();
  const { data: invitations } = useInvitations((res) => Object.values(res));
  const { invite: inviteMember, cancel } = useInvitationsActions();
  const deleteMember = (data: MemberRow) =>
    openModal(
      <DeleteMember
        onDelete={() => remove({ id: data.user.id, memberId: data.id })}
      />,
    );
  const deleteGuest = (data: GuestRow) =>
    openModal(
      <DeleteGuest
        name={data.user.name}
        onDelete={() => remove({ id: data.user.id, memberId: data.id })}
      />,
    );
  /** Handlers */
  const { isResetting, copyLink, updateLink } = useLinkActions();
  const resetLink = () =>
    openModal(<BaseModal {...modals["reset-link"]} onTrigger={updateLink} />);
  const invitedMembers = useInvitedMembers();
  const addMembers = () =>
    openModal(
      <AddMembers invitedMembers={invitedMembers} onAdd={inviteMember} />,
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
                disabled={isResetting}
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
      <Tabs defaultValue={PeopleTabs.Members} className="relative mt-1 w-full">
        <TabsList className="gap-3 overflow-y-auto p-0">
          <div className="flex grow">
            <TabsTrigger value={PeopleTabs.Members}>
              {tabs.members}
              <span className="text-muted">{members.length}</span>
            </TabsTrigger>
            <TabsTrigger value={PeopleTabs.Guests}>
              {tabs.guests}
              <span className="text-muted">{guests.length}</span>
            </TabsTrigger>
            <TabsTrigger value={PeopleTabs.Groups}>{tabs.groups}</TabsTrigger>
            <TabsTrigger value={PeopleTabs.Invitations}>
              {tabs.invitations}
              <span className="text-muted">{invitations.length}</span>
            </TabsTrigger>
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
        <TabsContent value={PeopleTabs.Members} className="mt-0 bg-transparent">
          <Dialog
            open={!!selectedTeamspace}
            onOpenChange={(open) => {
              if (open) return;
              setSelectedTeamspace(null);
            }}
          >
            {renderTeamspaceDetail()}
          </Dialog>
          <MembersTable
            userId={account.id}
            search={search}
            data={members}
            scopes={scopes}
            onUpdate={update}
            onDelete={deleteMember}
            onTeamspaceSelect={setSelectedTeamspace}
          />
        </TabsContent>
        <TabsContent value={PeopleTabs.Guests} className="mt-0 bg-transparent">
          <GuestsTable
            search={search}
            data={guests}
            scopes={scopes}
            onUpdate={update}
            onDelete={deleteGuest}
          />
        </TabsContent>
        <TabsContent value={PeopleTabs.Groups} className="mt-0 bg-transparent">
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
        <TabsContent
          value={PeopleTabs.Invitations}
          className="mt-0 bg-transparent"
        >
          <InvitationsTable
            scopes={scopes}
            data={invitations}
            onCancel={cancel}
          />
        </TabsContent>
      </Tabs>
    </SettingsSection>
  );
}
