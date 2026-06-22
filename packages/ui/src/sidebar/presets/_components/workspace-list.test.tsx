import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Plan, Role, type Workspace } from "@notion-kit/schemas";

import { DropdownMenu } from "@/primitives";

import { WorkspaceList } from "./workspace-list";

const workspaces: Workspace[] = [
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

describe("WorkspaceList", () => {
  it("renders workspaces through the shared sortable primitive", () => {
    render(
      <DropdownMenu>
        <WorkspaceList
          user={{ email: "owner@example.com" }}
          workspaces={workspaces}
        />
      </DropdownMenu>,
    );

    expect(
      document.querySelectorAll("[data-slot='sortable-item']"),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /move workspace/i }),
    ).toHaveLength(2);
  });
});
