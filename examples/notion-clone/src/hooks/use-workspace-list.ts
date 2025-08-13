"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import type { Organization } from "@notion-kit/auth";
import {
  useActiveWorkspace,
  useAuth,
  useListWorkspaces,
} from "@notion-kit/auth-ui";
import {
  IconObject,
  Plan,
  Role,
  type IconData,
  type Workspace,
} from "@notion-kit/schemas";

export function useWorkspaceList() {
  const router = useRouter();
  const { auth } = useAuth();
  const { data } = useActiveWorkspace();
  const { data: workspaces } = useListWorkspaces();

  const activeWorkspace = useMemo<Workspace>(() => {
    if (!data)
      return {
        id: "",
        name: "",
        icon: { type: "text", src: "" },
        role: Role.OWNER,
        plan: Plan.FREE,
        memberCount: 0,
      };
    return mapWorkspace(data);
  }, [data]);

  const workspaceList = useMemo(() => {
    if (!workspaces) return [];
    return workspaces.map<Workspace>((w) => mapWorkspace(w));
  }, [workspaces]);

  const selectWorkspace = useCallback(
    async (id: string) => {
      const res = await auth.organization.setActive({ organizationId: id });
      console.log(`[useWorkspaceList] Switching to workspace ${id}`);
      if (!res.data) {
        console.error("Failed to set active workspace");
        return;
      }
      router.push(`/workspace/${res.data.slug}`);
    },
    [auth.organization, router],
  );

  return { activeWorkspace, workspaceList, selectWorkspace };
}

function mapWorkspace(org: Organization): Workspace {
  const res = IconObject.safeParse(JSON.parse(org.logo ?? ""));
  const icon: IconData = res.success
    ? res.data
    : { type: "text", src: org.name[0] ?? "" };
  return {
    id: org.id,
    name: org.name,
    icon,
    // TODO handle memberships
    role: Role.OWNER,
    plan: Plan.FREE,
    memberCount: 1,
  };
}
