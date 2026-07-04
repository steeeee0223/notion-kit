import { render, screen } from "@testing-library/react";

import { Plan, Role, type Workspace } from "@notion-kit/schemas";

import { DropdownMenu } from "@/primitives";
import { WorkspaceList } from "@/sidebar/presets/_components/workspace-list";

const defaultWorkspaces: Workspace[] = [
  {
    id: "workspace-one",
    name: "Workspace One",
    memberCount: 2,
    plan: Plan.FREE,
    role: Role.OWNER,
  },
  {
    id: "workspace-two",
    name: "Workspace Two",
    memberCount: 4,
    plan: Plan.PLUS,
    role: Role.MEMBER,
  },
];

export class WorkspaceListObject {
  static render(workspaces: Workspace[] = defaultWorkspaces) {
    render(
      <DropdownMenu>
        <WorkspaceList
          user={{ email: "owner@example.com" }}
          workspaces={workspaces}
        />
      </DropdownMenu>,
    );

    return new WorkspaceListObject();
  }

  workspace(name: string) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return screen.getByRole("menuitemcheckbox", {
      name: new RegExp(`${escapedName}$`),
    });
  }

  moveHandle(name: string) {
    return screen.getByRole("button", { name: `Move workspace ${name}` });
  }
}
