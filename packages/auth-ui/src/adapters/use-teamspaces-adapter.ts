"use client";

import { useMemo } from "react";
import { z } from "zod/v4";

import { IconObject } from "@notion-kit/schemas";
import type { Teamspaces, TeamspacesAdapter } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";

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
          throw new Error(res.error.message);
        }
        return res.data.reduce<Teamspaces>((acc, team) => {
          acc[team.id] = {
            id: team.id,
            name: team.name,
            updatedAt: new Date(team.updatedAt ?? team.createdAt).getTime(),
            icon: IconObject.parse(JSON.parse(team.icon)),
            permission: z
              .enum(["default", "open", "closed", "private"])
              .parse(team.permission),
            ownedBy: team.ownedBy,
            members: team.members.map((m) => ({
              userId: m.userId,
              role: z.enum(["owner", "member"]).parse(m.role),
            })),
          };
          return acc;
        }, {});
      },
      add: async ({ icon, ...data }) => {
        const res = await orgApi.createTeam(
          { ...data, organizationId, icon: JSON.stringify(icon) },
          { throw: true },
        );
        await orgApi.addTeamMember(
          { organizationId, teamId: res.id, userId },
          { throw: true },
        );
        await orgExtraApi.updateTeamMember(
          { teamId: res.id, userId, role: "owner" },
          { throw: true },
        );
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
        await orgApi.removeTeam({ organizationId, teamId }, { throw: true });
      },
      leave: async (teamId) => {
        await orgApi.removeTeamMember(
          { organizationId, teamId, userId },
          { throw: true },
        );
      },
      addMembers: async ({ teamspaceId, userIds, role }) => {
        const results = await Promise.allSettled(
          userIds.map(async (userId) => {
            await orgApi.addTeamMember(
              { organizationId, teamId: teamspaceId, userId },
              { throw: true },
            );
            if (role === "owner") {
              await orgExtraApi.updateTeamMember(
                { teamId: teamspaceId, userId, role },
                { throw: true },
              );
            }
          }),
        );
        const failure = results.find((result) => result.status === "rejected");
        if (failure) throw failure.reason;
      },
      updateMember: async ({ teamspaceId, userId, role }) => {
        await orgExtraApi.updateTeamMember(
          {
            teamId: teamspaceId,
            userId,
            role,
          },
          { throw: true },
        );
      },
      deleteMember: async ({ teamspaceId, userId }) => {
        await orgApi.removeTeamMember(
          { organizationId, teamId: teamspaceId, userId },
          { throw: true },
        );
      },
    };
  }, [orgApi, orgExtraApi, organizationId, userId]);
}
