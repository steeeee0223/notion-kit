"use client";

import { useMemo } from "react";

import { Role, User } from "@notion-kit/schemas";

import { MemberTeamspace, type WorkspaceMemberships } from "../../lib";
import { useInvitations, usePeople, useTeamspaces } from "../hooks";

const defaultOptions = { current: null, options: [] };

export function useWorkspaceMemberships() {
  const { data: teamspaces } = useTeamspaces((res) =>
    Object.values(res).reduce<Record<string, MemberTeamspace[]>>(
      (acc, teamspace) => {
        teamspace.members.forEach((member) => {
          acc[member.userId] ??= [];
          acc[member.userId]!.push({
            id: teamspace.id,
            name: teamspace.name,
            icon: teamspace.icon,
            memberCount: teamspace.members.length,
          });
        });
        return acc;
      },
      {},
    ),
  );
  const { data } = usePeople((res) =>
    Object.values(res).reduce<WorkspaceMemberships>(
      (acc, member) => {
        if (member.role === Role.GUEST) {
          acc.guests.push({ ...member, access: [] });
        } else {
          acc.members.push({
            ...member,
            teamspaces: teamspaces[member.user.id] ?? [],
            groups: defaultOptions,
          });
        }
        return acc;
      },
      { members: [], guests: [] },
    ),
  );
  return data;
}

export function useInvitedMembers() {
  const { data: people } = usePeople((res) =>
    Object.values(res).map((mem) => mem.user),
  );
  const { data: invitations } = useInvitations((res) => {
    const users: User[] = [];
    Object.values(res).forEach((invitation) => {
      if (invitation.status !== "pending") return;
      users.push({
        id: invitation.id,
        email: invitation.email,
        name: invitation.email,
        avatarUrl: "",
      });
    });
    return users;
  });

  return useMemo(() => [...people, ...invitations], [people, invitations]);
}
