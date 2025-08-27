"use client";

import { useState } from "react";

import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import {
  Button,
  Dialog,
  DialogContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import type {
  Scope,
  TeamMemberRow,
  TeamspacePermission,
  TeamspaceRole,
} from "../../../lib";
import { Tab } from "./common";
import { GeneralContent } from "./general-content";
import { MembersContent } from "./members-content";
import { SecurityContent } from "./security-content";

interface TeamspaceDetailProps {
  scopes: Set<Scope>;
  workspace: string;
  teamspace: {
    name: string;
    icon: IconData;
    description?: string;
    permission: TeamspacePermission;
  };
  teamMembers: TeamMemberRow[];
  onLeave?: () => void | Promise<void>;
  onUpdateMember?: (data: {
    memberId: string;
    role: TeamspaceRole;
  }) => void | Promise<void>;
  onRemoveMember?: (memberId: string) => void | Promise<void>;
}

export function TeamspaceDetail({
  scopes,
  workspace,
  teamspace,
  teamMembers,
  onLeave,
  onUpdateMember,
  onRemoveMember,
}: TeamspaceDetailProps) {
  const { isOpen, closeModal } = useModal();
  const [tab, setTab] = useState(Tab.Members);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent
          className="block h-160 w-[630px] max-w-[unset] overflow-hidden p-9 pt-5"
          onClick={(e) => e.stopPropagation()}
          hideClose
          noTitle
        >
          <div className="flex h-[26px] shrink-0 grow-0 items-center gap-2">
            <IconBlock icon={teamspace.icon} size="sm" />
            <div className="truncate text-base font-semibold">
              {teamspace.name}
            </div>
            <div className="grow-1" />
            <TooltipPreset side="top" description="Click to leave teamspace">
              <Button
                tabIndex={-1}
                variant={null}
                className="h-7 rounded-full bg-default/5 px-2.5 hover:bg-default/15"
              >
                <Icon.Check className="block h-full w-3 fill-current" />
                Joined
              </Button>
            </TooltipPreset>
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
                scopes={scopes}
                workspace={workspace}
                teamspace={teamspace}
                teamMembers={teamMembers}
                onUpdateMember={onUpdateMember}
                onRemoveMember={onRemoveMember}
              />
            </TabsContent>
            <TabsContent value={Tab.Security}>
              <SecurityContent />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
