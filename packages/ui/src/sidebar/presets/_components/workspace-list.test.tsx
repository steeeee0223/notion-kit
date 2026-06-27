import { describe, expect, it } from "vitest";

import { WorkspaceListObject } from "@/__tests__/component-objects/workspace-list";

describe("WorkspaceList", () => {
  it("WorkspaceList_WithWorkspaces_RendersSortableControls", () => {
    const list = WorkspaceListObject.render();

    expect(list.workspace("Workspace One")).toBeInTheDocument();
    expect(list.workspace("Workspace Two")).toBeInTheDocument();
    expect(list.moveHandle("Workspace One")).toBeInTheDocument();
    expect(list.moveHandle("Workspace Two")).toBeInTheDocument();
  });
});
