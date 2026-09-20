"use client";

import { useMemo } from "react";

import type { Role, User } from "@notion-kit/schemas";
import type { PeopleAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
import { displayRole } from "./utils";

export function usePeopleAdapter(): PeopleAdapter | undefined {
  const { auth } = useAuth();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const orgApi = auth.organization;

  return useMemo<PeopleAdapter | undefined>(() => {
    if (!organizationId) return undefined;
    return {
      getAll: async () => {
        const members: Record<string, { id: string; role: Role; user: User }> =
          {};
        let offset = 0;
        while (true) {
          const result = await orgApi.listMembers({
            query: { organizationId, limit: 100, offset },
          });
          if (result.error) throw new Error(result.error.message);
          for (const member of result.data.members) {
            members[member.user.id] = {
              id: member.id,
              role: displayRole(member.role),
              user: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                avatarUrl: member.user.image ?? "",
              },
            };
          }
          offset += result.data.members.length;
          if (offset >= result.data.total) break;
          if (result.data.members.length === 0)
            throw new Error(
              "Member pagination ended before all members were returned.",
            );
        }
        return members;
      },
      update: async ({ memberId, role }) => {
        await orgApi.updateMemberRole(
          { organizationId, memberId, role },
          { throw: true },
        );
      },
      delete: async ({ memberId }) => {
        await orgApi.removeMember(
          { organizationId, memberIdOrEmail: memberId },
          { throw: true },
        );
      },
    };
  }, [orgApi, organizationId]);
}
