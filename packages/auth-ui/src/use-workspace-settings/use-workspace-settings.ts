"use client";

import { useMemo } from "react";

import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
  Invitations,
  Memberships,
  SettingsActions,
  WorkspaceStore,
} from "@notion-kit/settings-panel";
import { toast } from "@notion-kit/shadcn";

import { useActiveWorkspace, useAuth } from "../auth-provider";
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
  const { auth, redirect } = useAuth();
  const { data: workspace } = useActiveWorkspace();

  const workspaceStore = useMemo<WorkspaceStore>(() => {
    if (!workspace) return initialWorkspaceStore;
    const res = IconObject.safeParse(JSON.parse(workspace.logo ?? ""));
    const icon: IconData = res.success
      ? res.data
      : { type: "text", src: workspace.name };

    return {
      id: workspace.id,
      name: workspace.name,
      icon,
      slug: workspace.slug,
      inviteLink: "",
      // TODO handle memberships
      plan: Plan.FREE,
      role: Role.OWNER,
    };
  }, [workspace]);

  const actions = useMemo<SettingsActions>(() => {
    const organizationId = workspace?.id;
    if (!organizationId) return {};
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
                id: m.userId,
                name: m.user.name,
                email: m.user.email,
                avatarUrl: m.user.image ?? "",
              },
            };
            return acc;
          }, {});
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
        add: async ({ emails }) => {
          await Promise.all(
            emails.map((email) =>
              auth.organization.inviteMember(
                {
                  organizationId,
                  email,
                  role: "member", // TODO
                  resend: true,
                },
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
    };
  }, [auth.organization, workspace?.id, redirect]);

  return {
    workspaceStore,
    actions,
  };
}
