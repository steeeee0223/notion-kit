"use client";

import { useMemo } from "react";

import type { Team } from "@notion-kit/auth";
import type { IconData } from "@notion-kit/schemas";
import type { Teamspaces, TeamspacesAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { handleError } from "../lib";

export function useTeamspacesAdapter(): TeamspacesAdapter | undefined {
  const { auth } = useAuth();
  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;
  const userId = session?.user.id;
  const orgApi = auth.organization;

  return useMemo<TeamspacesAdapter | undefined>(() => {
    if (!organizationId || !userId) return undefined;
    return {
      getAll: async () => {
        const teams = await orgApi.listTeams({
          query: { organizationId },
        });
        if (teams.error) {
          handleError(teams, "Fetch teamspaces failed");
          return {};
        }
        const data: Teamspaces = {};
        const results = await Promise.all(
          teams.data.map((team) =>
            orgApi.listTeamMembers({
              query: { teamId: team.id },
            }),
          ),
        );
        results.forEach((res, index) => {
          const team = teams.data[index]! as Team;
          data[team.id] = {
            id: team.id,
            name: team.name,
            updatedAt: (team.updatedAt ?? team.createdAt).getTime(),
            icon: JSON.parse(team.icon) as IconData,
            permission: team.permission,
            ownedBy: team.ownedBy,
            members:
              res.data?.map((m) => ({
                userId: m.userId,
                // TODO update role
                role: "owner",
              })) ?? [],
          };
        });
        return data;
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
      addMembers: async ({ teamspaceId, userIds }) => {
        // TODO cannot add role
        await Promise.all(
          userIds.map((uid) =>
            orgApi.addTeamMember(
              { teamId: teamspaceId, userId: uid },
              { throw: true },
            ),
          ),
        );
      },
      updateMember: async () => {
        // TODO
        console.warn("Not implemented");
        await Promise.resolve();
      },
      deleteMember: async ({ teamspaceId, userId: uid }) => {
        await orgApi.removeTeamMember(
          { teamId: teamspaceId, userId: uid },
          { throw: true },
        );
      },
    };
  }, [orgApi, organizationId, userId]);
}
