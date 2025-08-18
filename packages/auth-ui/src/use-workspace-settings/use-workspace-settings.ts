"use client";

import { useMemo } from "react";

import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
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
        add: async (emails) => {
          await Promise.all(
            emails.map((email) =>
              auth.organization.inviteMember(
                {
                  organizationId,
                  email,
                  role: "member", // TODO
                  resend: true,
                },
                {
                  onSuccess: () => void toast.success("Invitation mail sent"),
                  onError: (e) => handleError(e, "Invite user failed"),
                },
              ),
            ),
          );
        },
        delete: async (id) => {
          await auth.organization.removeMember(
            { organizationId, memberIdOrEmail: id },
            {
              onSuccess: () => void toast.success("Member removed"),
              onError: (e) => handleError(e, "Remove member failed"),
            },
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
