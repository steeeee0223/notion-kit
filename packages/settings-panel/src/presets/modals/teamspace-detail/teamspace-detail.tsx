"use client";

import { useState } from "react";

import { useTemporaryFix } from "@notion-kit/hooks";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { User } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import type {
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
} from "../../../lib";
import { LeaveTeamspace } from "../leave-teamspace";
import { Tab } from "./common";
import { GeneralContent } from "./general-content";
import { MembersContent } from "./members-content";
import { SecurityContent } from "./security-content";

interface TeamspaceDetailProps {
  workspace: string;
  teamspace: {
    name: string;
    icon: IconData;
    description?: string;
    permission: TeamspacePermission;
    role?: TeamspaceRole | false;
  };
  teamMembers: TeamMemberRow[];
  onClose?: () => void;
  onLeave?: () => void | Promise<void>;
  onJoin?: () => void | Promise<void>;
  onAddMembers?: (data: {
    userIds: string[];
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onUpdateMember?: (data: {
    userId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemoveMember?: (userId: string) => void | Promise<void>;
  onFetchWorkspaceMembers?: () => User[] | Promise<User[]>;
}

export function TeamspaceDetail({
  workspace,
  teamspace,
  teamMembers,
  onClose,
  onLeave,
  onJoin,
  onAddMembers,
  onUpdateMember,
  onRemoveMember,
  onFetchWorkspaceMembers,
}: TeamspaceDetailProps) {
  const { onCloseAutoFocus } = useTemporaryFix();
  const [tab, setTab] = useState(Tab.Members);

  const [openLeave, setOpenLeave] = useState(false);

  return (
    <TooltipProvider>
      <DialogContent
        className="block h-160 w-[630px] max-w-[unset] overflow-hidden p-9 pt-5"
        onClick={(e) => e.stopPropagation()}
        hideClose
        noTitle
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <div className="flex h-[26px] shrink-0 grow-0 items-center gap-2">
          <IconBlock icon={teamspace.icon} size="sm" />
          <div className="truncate text-base font-semibold">
            {teamspace.name}
          </div>
          <div className="grow-1" />
          {teamspace.role ? (
            <Dialog open={openLeave} onOpenChange={setOpenLeave}>
              <TooltipPreset side="top" description="Click to leave teamspace">
                <DialogTrigger asChild>
                  <Button
                    tabIndex={-1}
                    variant={null}
                    className="h-7 rounded-full bg-default/5 px-2.5 hover:bg-default/15"
                  >
                    <Icon.Check className="block h-full w-3 fill-current" />
                    Joined
                  </Button>
                </DialogTrigger>
              </TooltipPreset>
              <LeaveTeamspace
                name={teamspace.name}
                onLeave={onLeave}
                onClose={() => {
                  setOpenLeave(false);
                  onClose?.();
                }}
              />
            </Dialog>
          ) : (
            <Button
              tabIndex={-1}
              variant={null}
              className="h-7 rounded-full bg-default/5 px-2.5 hover:bg-default/15"
              onClick={onJoin}
            >
              Join
            </Button>
          )}
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="mb-5">
            <TabsTrigger value={Tab.General}>General</TabsTrigger>
            <TabsTrigger value={Tab.Members}>
              Members
              <span className="text-muted">{teamMembers.length}</span>
            </TabsTrigger>
            <TabsTrigger value={Tab.Security}>Security</TabsTrigger>
          </TabsList>
          <TabsContent value={Tab.General}>
            <GeneralContent
              workspace={workspace}
              teamspace={teamspace}
              onTabChange={setTab}
              onLeave={onLeave}
            />
          </TabsContent>
          <TabsContent value={Tab.Members} className="h-125 overflow-hidden">
            <MembersContent
              workspace={workspace}
              teamspace={teamspace}
              teamMembers={teamMembers}
              onAddMembers={onAddMembers}
              onUpdateMember={onUpdateMember}
              onRemoveMember={onRemoveMember}
              onFetchWorkspaceMembers={onFetchWorkspaceMembers}
            />
          </TabsContent>
          <TabsContent value={Tab.Security}>
            <SecurityContent />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </TooltipProvider>
  );
}
