"use client";

import { useMemo } from "react";
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
          await auth.organization.update(
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
          await auth.organization.delete(
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
          await auth.organization.leave(
            { organizationId },
            {
              onSuccess: () => redirect?.("/"),
              onError: (e) => handleError(e, "Leave workspace failed"),
            },
          );
        },
        resetLink: async () => {
          await auth.organization.update(
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
          const result = await auth.organization.listMembers({
            query: { organizationId },
          });
          if (!result.data) {
            handleError(result, "Fetch members failed");
            return {};
          }
          return result.data.members.reduce<Memberships>((acc, m) => {
            acc[m.userId] = {
              role: m.role as Role,
              user: {
                id: m.id,
                name: m.user.name,
                email: m.user.email,
                avatarUrl: m.user.image ?? "",
              },
            };
            return acc;
          }, {});
        },
        update: async ({ id, role }) => {
          await auth.organization.updateMemberRole(
            { organizationId, memberId: id, role },
            { throw: true },
          );
        },
        delete: async (id) => {
          await auth.organization.removeMember(
            { organizationId, memberIdOrEmail: id },
            { throw: true },
          );
        },
      },
      invitations: {
        getAll: async () => {
          const res = await auth.organization.listInvitations({
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
          const members = await auth.organization.listMembers({
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
              auth.organization.inviteMember(
                { organizationId, email, role, resend: true },
                { throw: true },
              ),
            ),
          );
        },
        cancel: async (invitationId) => {
          await auth.organization.cancelInvitation(
            { invitationId },
            { throw: true },
          );
        },
      },
      teamspaces: {
        getAll: async () => {
          const teams = await auth.organization.listTeams({
            query: { organizationId },
          });

          if (teams.error) {
            handleError(teams, "Fetch teamspaces failed");
            return {};
          }
          const data: Teamspaces = {};
          const results = await Promise.all(
            teams.data.map((team) =>
              auth.organization.listTeamMembers({
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
              // TODO update these
              members:
                res.data?.map((m) => ({
                  userId: m.userId,
                  role: "owner",
                })) ?? [],
            };
          });
          return data;
        },
        add: async ({ icon, ...data }) => {
          const res = await auth.organization.createTeam(
            { ...data, icon: JSON.stringify(icon) },
            { throw: true },
          );
          await auth.organization.addTeamMember({ teamId: res.id, userId });
        },
        update: async ({ id, icon, ...data }) => {
          await auth.organization.updateTeam(
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
          await auth.organization.removeTeam({ teamId }, { throw: true });
        },
        leave: async (teamId) => {
          await auth.organization.removeTeamMember(
            { teamId, userId },
            { throw: true },
          );
        },
        addMember: async ({ teamspaceId, userId }) => {
          // TODO cannot add role
          await auth.organization.addTeamMember(
            { teamId: teamspaceId, userId },
            { throw: true },
          );
        },
        updateMember: async () => {
          // TODO
          console.warn("Not implemented");
          await Promise.resolve();
        },
        deleteMember: async ({ teamspaceId, userId }) => {
          await auth.organization.removeTeamMember(
            { teamId: teamspaceId, userId },
            { throw: true },
          );
        },
      },
    };
  }, [auth.organization, redirect, session?.user.id, workspace?.id]);

  return {
    workspaceStore,
    actions,
  };
}
