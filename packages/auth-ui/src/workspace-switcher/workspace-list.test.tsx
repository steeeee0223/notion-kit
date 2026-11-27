import { expect, it } from "vitest";

import { Plan, Role, type Workspace } from "@notion-kit/schemas";

import { WorkspaceListObject } from "./workspace-list-object";

const notes: Workspace = {
  id: "workspace-notes",
  name: "Notes",
  memberCount: 2,
  plan: Plan.FREE,
  role: Role.OWNER,
};

const tasks: Workspace = {
  ...notes,
  id: "workspace-tasks",
  name: "Tasks",
  role: Role.MEMBER,
};

it("WorkspaceList_WhenWorkspacesArriveAndChange_ReconcilesTheMenu", () => {
  const list = WorkspaceListObject.render([]);
  expect(list.workspaces()).toHaveLength(0);

  list.update([notes, tasks], tasks.id);

  expect(list.workspaces()).toEqual([
    list.workspace("Notes"),
    list.workspace("Tasks"),
  ]);
  expect(list.workspace("Tasks").getAttribute("aria-checked")).toBe("true");
  expect(list.moveHandle("Notes").getAttribute("aria-label")).toBe(
    "Move workspace Notes",
  );

  list.update([{ ...tasks, name: "Projects" }], tasks.id);

  expect(list.workspaces()).toEqual([list.workspace("Projects")]);
  expect(list.workspace("Projects").getAttribute("aria-checked")).toBe("true");
});
