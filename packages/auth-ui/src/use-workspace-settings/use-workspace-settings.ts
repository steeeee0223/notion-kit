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
  domain: "",
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
      : { type: "text", src: data.name[0] ?? "" };

    return {
      id: data.id,
      name: data.name,
      icon,
      domain: "",
      inviteLink: data.slug,
      // TODO handle memberships
      plan: Plan.FREE,
      role: Role.OWNER,
    };
  }, [data]);

  const actions = useMemo<SettingsActions>(() => {
    return {
      workspace: {
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
