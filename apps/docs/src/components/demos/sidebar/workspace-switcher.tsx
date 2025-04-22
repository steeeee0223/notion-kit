"use client";

import type { User, Workspace } from "@notion-kit/schemas";
import { Plan, Role } from "@notion-kit/schemas";
import { WorkspaceSwitcher } from "@notion-kit/sidebar";

export const user: User = {
  id: "u1",
  name: "Admin",
  email: "admin@email.com",
  avatarUrl: "",
};

export const workspaces: Workspace[] = [
  {
    id: "w1",
    name: "Workspace",
    role: Role.OWNER,
    memberCount: 5,
    plan: Plan.FREE,
  },
  {
    id: "w2",
    name: "Workspace 2",
    role: Role.GUEST,
    memberCount: 2,
    plan: Plan.EDUCATION,
  },
  {
    id: "w3",
    name: "Workspace 3",
    role: Role.OWNER,
    memberCount: 10,
    plan: Plan.ENTERPRISE,
  },
  {
    id: "w4",
    name: "Workspace 4",
    role: Role.MEMBER,
    memberCount: 12,
    plan: Plan.PLUS,
  },
];

export default function Demo() {
  return (
    <div className="w-[200px]">
      <WorkspaceSwitcher
        user={user}
        workspaces={workspaces}
        activeWorkspace={workspaces[0]!}
      />
    </div>
  );
}
