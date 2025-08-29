"use client";

import { useSettings } from "../../core";
import type { TeamspaceRow } from "../../lib";
import { usePeople, useTeamspaces } from "../hooks";

export function useTeamspacesTable() {
  const {
    settings: { account },
  } = useSettings();
  const { data: people } = usePeople();
  const { data } = useTeamspaces<TeamspaceRow[]>((res) =>
    Object.values(res).map((t) => {
      const { owners, role } = t.members.reduce<
        Pick<TeamspaceRow, "owners" | "role">
      >(
        (acc, m) => {
          const person = people[m.userId];
          if (!person) return acc;
          if (person.user.id === account.id) {
            acc.role = m.role;
          }
          if (m.role !== "owner") return acc;
          acc.owners.count += 1;
          if (!acc.owners.ownerName) {
            acc.owners.ownerName = person.user.name;
            acc.owners.ownerAvatarUrl = person.user.avatarUrl;
          }
          return acc;
        },
        { owners: { ownerName: "", count: 0 } },
      );

      return {
        id: t.id,
        name: t.name,
        icon: t.icon,
        description: t.description,
        permission: t.permission,
        updatedAt: t.updatedAt,
        memberCount: t.members.length,
        owners,
        role,
      };
    }),
  );
  return data;
}
