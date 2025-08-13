"use client";

import { useMemo } from "react";

import { IconObject, Plan, Role, type IconData } from "@notion-kit/schemas";
import type {
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
  const { auth } = useAuth();
  const { data } = useActiveWorkspace();

  const workspaceStore = useMemo<WorkspaceStore>(() => {
    if (!data) return initialWorkspaceStore;
    const res = IconObject.safeParse(JSON.parse(data.logo ?? ""));
    const icon: IconData = res.success
      ? res.data
      : { type: "text", src: data.name };

    return {
      id: data.id,
      name: data.name,
      icon,
      slug: data.slug,
      inviteLink: "",
      // TODO handle memberships
      plan: Plan.FREE,
      role: Role.OWNER,
    };
  }, [data]);

  const actions = useMemo<SettingsActions>(() => {
    return {
      workspace: {
        update: async (id, { name, icon }) => {
          await auth.organization.update(
            {
              organizationId: id,
              data: {
                name,
                logo: icon ? JSON.stringify(icon) : undefined,
              },
            },
            {
              onSuccess: () => void toast.success("Workspace updated"),
              onError: (e) => handleError(e, "Update workspace error"),
            },
          );
        },
        delete: async (workspaceId) => {
          await auth.organization.delete(
            { organizationId: workspaceId },
            {
              onSuccess: () => void toast.success("Workspace deleted"),
              onError: (e) => handleError(e, "Delete workspace error"),
            },
          );
        },
      },
    };
  }, [auth]);

  return {
    workspaceStore,
    actions,
  };
}
