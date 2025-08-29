"use client";

import { useCallback, useState } from "react";

import { Role } from "@notion-kit/schemas";

import { useSettings } from "../../core";
import { TeamMemberRow } from "../../lib";
import { TeamspaceDetail } from "../modals";
import { usePeople, useTeamspaces } from "./queries";
import { useTeamspaceActions } from "./use-teamspace-actions";

export function useTeamspaceDetail() {
  const {
    settings: { account, workspace },
  } = useSettings();
  const [selectedTeamspace, setSelectedTeamspace] = useState<string | null>(
    null,
  );

  const { data: people } = usePeople();
  const { data: teamspaces } = useTeamspaces();
  const { leave, updateMember, removeMember } = useTeamspaceActions();

  const renderTeamspaceDetail = useCallback(() => {
    if (!selectedTeamspace) return null;
    const teamspace = teamspaces[selectedTeamspace];
    if (!teamspace) return;
    const role = teamspace.members.find((m) => m.userId === account.id)?.role;
    return (
      <TeamspaceDetail
        workspace={workspace.name}
        teamspace={{
          name: teamspace.name,
          description: teamspace.description,
          icon: teamspace.icon,
          permission: teamspace.permission,
          role,
        }}
        teamMembers={teamspace.members.reduce<TeamMemberRow[]>((acc, m) => {
          const person = people[m.userId];
          if (!person) return acc;
          acc.push({
            id: m.userId,
            role: m.role,
            user: person.user,
            isWorkspaceOwner: person.role === Role.OWNER,
          });
          return acc;
        }, [])}
        onLeave={() => leave(selectedTeamspace)}
        onUpdateMember={(data) =>
          updateMember({ teamspaceId: selectedTeamspace, ...data })
        }
        onRemoveMember={(userId) =>
          removeMember({ teamspaceId: selectedTeamspace, userId })
        }
      />
    );
  }, [
    account.id,
    leave,
    people,
    removeMember,
    selectedTeamspace,
    teamspaces,
    updateMember,
    workspace.name,
  ]);

  return { selectedTeamspace, setSelectedTeamspace, renderTeamspaceDetail };
}
