"use client";

import type { MultiSelectOption } from "@notion-kit/shadcn";
import { idToColor } from "@notion-kit/utils";

import type { TeamspaceRow } from "../../lib";
import { useAccount, usePeople, useTeamspaces } from "../hooks";

export function useTeamspacesTable() {
  const { data: account } = useAccount();
  const { data: people } = usePeople();
  const { data } = useTeamspaces<TeamspaceRow[]>((teamspaces) =>
    Object.values(teamspaces).map((teamspace) => {
      const owner = people[teamspace.ownedBy];
      const { ownerCount, role } = teamspace.members.reduce<
        Pick<TeamspaceRow, "ownerCount" | "role">
      >(
        (acc, teamMember) => {
          const person = people[teamMember.userId];
          if (!person) return acc;
          if (person.user.id === account.id) {
            acc.role = teamMember.role;
          }
          if (teamMember.role !== "owner") return acc;
          acc.ownerCount += 1;
          return acc;
        },
        { ownerCount: 0 },
      );

      return {
        id: teamspace.id,
        name: teamspace.name,
        icon: teamspace.icon,
        description: teamspace.description,
        permission: teamspace.permission,
        updatedAt: teamspace.updatedAt,
        memberCount: teamspace.members.length,
        ownedBy: owner
          ? {
              name: owner.user.name,
              avatarUrl: owner.user.avatarUrl,
            }
          : { name: "User" },
        ownerCount,
        role,
      };
    }),
  );
  return data;
}

export function useTeamspaceOptions() {
  const { data } = useTeamspaces<MultiSelectOption[]>((res) =>
    Object.values(res).map((t) => ({
      label: t.name,
      value: t.name,
      id: t.id,
      color: idToColor(t.id),
      icon: JSON.stringify(t.icon),
    })),
  );
  return data;
}
