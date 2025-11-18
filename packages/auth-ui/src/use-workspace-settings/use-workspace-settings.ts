"use client";

import { useMemo, useState } from "react";
import { v4 } from "uuid";

import type { Team, WorkspaceMetadata } from "@notion-kit/auth";
import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
  Invitations,
  Memberships,
  SettingsActions,
  Teamspaces,
  WorkspaceStore,
} from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { handleError } from "../lib";

const initialWorkspaceStore: WorkspaceStore = {
  id: "",
  name: "",
  icon: { type: "text", src: "" },
  slug: "",
  inviteLink: "",
  plan: Plan.FREE,
  role: Role.OWNER,
};

export function useWorkspaceSettings() {
  const { baseURL, auth, redirect } = useAuth();
  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const [orgApi] = useState(auth.organization);

  const workspaceStore = useMemo<WorkspaceStore>(() => {
    if (!workspace) return initialWorkspaceStore;
    const user = workspace.members.find((m) => m.userId === session?.user.id);
    if (!user) {
      console.error(
        "[useWorkspaceSettings] User not found in workspace members",
      );
      return initialWorkspaceStore;
    }
    const res = IconObject.safeParse(JSON.parse(workspace.logo ?? ""));
    const icon: IconData = res.success
      ? res.data
      : { type: "text", src: workspace.name };
    const metadata = JSON.parse(
      workspace.metadata as string,
    ) as WorkspaceMetadata;
    const inviteLink = metadata.inviteToken
      ? `${baseURL}/invite/${metadata.inviteToken}`
      : "";

    return {
      id: workspace.id,
      name: workspace.name,
      icon,
      slug: workspace.slug,
      inviteLink,
      role: user.role as Role,
      // TODO
      plan: Plan.FREE,
    };
  }, [baseURL, session?.user.id, workspace]);

  const actions = useMemo<SettingsActions>(() => {
    const userId = session?.user.id;
    const organizationId = workspace?.id;
    if (!organizationId || !userId) return {};
    return {
      workspace: {
        update: async ({ name, icon }) => {
          await orgApi.update(
            {
              organizationId,
              data: {
                name,
                logo: icon ? JSON.stringify(icon) : undefined,
              },
            },
            {
              onSuccess: () => void toast.success("Workspace updated"),
              onError: (e) => handleError(e, "Update workspace failed"),
            },
          );
        },
        delete: async () => {
          await orgApi.delete(
            { organizationId },
            {
              onSuccess: () => {
                toast.success("Workspace deleted");
                redirect?.("/");
              },
              onError: (e) => handleError(e, "Delete workspace failed"),
            },
          );
        },
        leave: async () => {
          await orgApi.leave(
            { organizationId },
            {
              onSuccess: () => redirect?.("/"),
              onError: (e) => handleError(e, "Leave workspace failed"),
            },
          );
        },
        resetLink: async () => {
          await orgApi.update(
            {
              organizationId,
              data: {
                metadata: { inviteToken: v4() } satisfies WorkspaceMetadata,
              },
            },
            { throw: true },
          );
        },
      },
      people: {
        getAll: async () => {
          const result = await orgApi.listMembers({
            query: { organizationId },
          });
          if (!result.data) {
            handleError(result, "Fetch members failed");
            return {};
          }
          return result.data.members.reduce<Memberships>((acc, m) => {
            acc[m.user.id] = {
              id: m.id,
              role: m.role as Role,
              user: {
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                avatarUrl: m.user.image ?? "",
              },
            };
            return acc;
          }, {});
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
      },
      invitations: {
        getAll: async () => {
          const res = await orgApi.listInvitations({
            query: { organizationId },
          });
          if (res.error) {
            handleError(res, "Fetch invitations failed");
            return {};
          }
          const invitations: Invitations = {};
          const invitationMap: Record<string, string[]> = {}; // maps: invitor id -> invitation ids
          res.data.forEach((invitation) => {
            if (invitation.status === "accepted") return;
            if (invitationMap[invitation.inviterId]) {
              invitationMap[invitation.inviterId]!.push(invitation.id);
            } else {
              invitationMap[invitation.inviterId] = [invitation.id];
            }
            invitations[invitation.id] = {
              id: invitation.id,
              email: invitation.email,
              role: invitation.role as Role,
              status: invitation.status,
              invitedBy: {
                id: invitation.inviterId,
                name: "Unknown",
                email: "",
                avatarUrl: "",
              },
            };
          });
          const members = await orgApi.listMembers({
            query: { organizationId },
          });
          if (members.error) {
            console.error(`[invitations:getAll] Fetch error`, members.error);
            return invitations;
          }
          members.data.members.forEach((mem) => {
            const invitationIds = invitationMap[mem.userId];
            if (!invitationIds) return;
            invitationIds.forEach((invitationId) => {
              invitations[invitationId]!.invitedBy = {
                id: mem.userId,
                name: mem.user.name,
                email: mem.user.email,
                avatarUrl: mem.user.image ?? "",
              };
            });
          });
          return invitations;
        },
        add: async ({ emails, role }) => {
          await Promise.all(
            emails.map((email) =>
              orgApi.inviteMember(
                { organizationId, email, role, resend: true },
                { throw: true },
              ),
            ),
          );
        },
        cancel: async (invitationId) => {
          await orgApi.cancelInvitation({ invitationId }, { throw: true });
        },
      },
      teamspaces: {
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
              updatedAt: (team.updatedAt ?? team.createdAt).getMilliseconds(),
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
            userIds.map((userId) =>
              orgApi.addTeamMember(
                { teamId: teamspaceId, userId },
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
        deleteMember: async ({ teamspaceId, userId }) => {
          await orgApi.removeTeamMember(
            { teamId: teamspaceId, userId },
            { throw: true },
          );
        },
      },
    };
  }, [orgApi, redirect, session?.user.id, workspace?.id]);

  return {
    workspaceStore,
    actions,
  };
}
