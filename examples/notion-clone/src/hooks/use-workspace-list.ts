"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Organization } from "@notion-kit/auth";
import {
  useActiveWorkspace,
  useAuth,
  useListWorkspaces,
  useSession,
} from "@notion-kit/auth-ui";
import {
  IconObject,
  Plan,
  Role,
  type IconData,
  type Workspace,
} from "@notion-kit/schemas";

const defaultWorkspace: Workspace = {
  id: "",
  name: "",
  icon: { type: "text", src: "" },
  role: Role.OWNER,
  plan: Plan.FREE,
  memberCount: 0,
};

export function useWorkspaceList() {
  const router = useRouter();
  const { auth } = useAuth();
  const { data: session } = useSession();
  const { data: active } = useActiveWorkspace();
  const { data: workspaces } = useListWorkspaces();

  const listMembersApi = useRef(auth.organization.listMembers);

  const [activeWorkspace, setActiveWorkspace] =
    useState<Workspace>(defaultWorkspace);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!workspaces || !session?.user.id) return;
      const memberships = await Promise.all(
        workspaces.map((w) =>
          listMembersApi.current({ query: { organizationId: w.id } }),
        ),
      );
      const updatedWorkspaces = workspaces.map((w, i) => ({
        ...mapWorkspace(w),
        ...(memberships[i]?.data
          ? {
              memberCount: memberships[i].data.total,
              role: memberships[i].data.members.find(
                (m) => m.userId === session.user.id,
              )?.role as Role,
            }
          : {}),
      }));
      setWorkspaceList(updatedWorkspaces);
      setActiveWorkspace(
        updatedWorkspaces.find((w) => w.id === active?.id) ?? defaultWorkspace,
      );
    };
    void fetchMemberships();
  }, [active?.id, auth.organization, session?.user.id, workspaces]);

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
