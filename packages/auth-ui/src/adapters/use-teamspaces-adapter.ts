"use client";

import { useMemo } from "react";

import type { IconData } from "@notion-kit/schemas";
import type {
  TeamspacePermission,
  TeamspaceRole,
  Teamspaces,
  TeamspacesAdapter,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { handleError } from "../lib";

export function useTeamspacesAdapter(): TeamspacesAdapter | undefined {
  const { auth } = useAuth();
  const orgApi = auth.organization;
  const orgExtraApi = auth.organizationExtra;

  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const userId = session?.user.id;

  return useMemo<TeamspacesAdapter | undefined>(() => {
    if (!organizationId || !userId) return undefined;
    return {
      getAll: async () => {
        const res = await orgExtraApi.listTeamsWithMembers({
          query: { organizationId },
        });
        if (res.error) {
          handleError(res, "Fetch teamspaces failed");
          return {};
        }
        return res.data.reduce<Teamspaces>((acc, team) => {
          acc[team.id] = {
            id: team.id,
            name: team.name,
            updatedAt: new Date(team.updatedAt ?? team.createdAt).getTime(),
            icon: JSON.parse(team.icon) as IconData,
            permission: team.permission as TeamspacePermission,
            ownedBy: team.ownedBy,
            members: team.members.map((m) => ({
              userId: m.userId,
              role: m.role as TeamspaceRole,
            })),
          };
          return acc;
        }, {});
      },
      add: async ({ icon, ...data }) => {
        const res = await orgApi.createTeam(
          { ...data, icon: JSON.stringify(icon), ownedBy: userId },
          { throw: true },
        );
        await orgApi.addTeamMember({ teamId: res.id, userId });
      },
      update: async ({ id, icon, ...data }) => {
        await orgApi.updateTeam(
          {
            teamId: id,
            data: {
              icon: icon ? JSON.stringify(icon) : undefined,
              ...data,
            },
          },
          { throw: true },
        );
      },
      delete: async (teamId) => {
        await orgApi.removeTeam({ teamId }, { throw: true });
      },
      leave: async (teamId) => {
        await orgApi.removeTeamMember({ teamId, userId }, { throw: true });
      },
      addMembers: async ({ teamspaceId, userIds, role }) => {
        await Promise.all(
          userIds.map((userId) =>
            orgExtraApi.addTeamMemberWithRole({
              teamId: teamspaceId,
              userId,
              role,
            }),
          ),
        );
      },
      updateMember: async ({ teamspaceId, userId, role }) => {
        await orgExtraApi.updateTeamMember({
          teamId: teamspaceId,
          userId,
          role,
        });
      },
      deleteMember: async ({ teamspaceId, userId }) => {
        await orgApi.removeTeamMember(
          { teamId: teamspaceId, userId },
          { throw: true },
        );
      },
    };
  }, [orgApi, orgExtraApi, organizationId, userId]);
}
