import {
  render,
  screen,
  within,
  type RenderResult,
} from "@testing-library/react";

import type { Workspace } from "@notion-kit/schemas";
import { DropdownMenu } from "@notion-kit/ui/primitives";

import { WorkspaceList } from "./workspace-list";

function workspaceList(workspaces: Workspace[], activeWorkspace?: string) {
  return (
    <DropdownMenu>
      <WorkspaceList
        user={{ email: "owner@example.com" }}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
      />
    </DropdownMenu>
  );
}

export class WorkspaceListObject {
  private constructor(private readonly view: RenderResult) {}

  static render(workspaces: Workspace[], activeWorkspace?: string) {
    return new WorkspaceListObject(
      render(workspaceList(workspaces, activeWorkspace)),
    );
  }

  update(workspaces: Workspace[], activeWorkspace?: string) {
    this.view.rerender(workspaceList(workspaces, activeWorkspace));
  }

  workspaces() {
    return within(screen.getByRole("group")).queryAllByRole("menuitemcheckbox");
  }

  workspace(name: string) {
    return within(screen.getByRole("group")).getByRole("menuitemcheckbox", {
      name: (label) => label === name || label.endsWith(` ${name}`),
    });
  }

  moveHandle(name: string) {
    return within(this.workspace(name)).getByRole("button", {
      name: /^Move workspace/,
    });
  }
}
