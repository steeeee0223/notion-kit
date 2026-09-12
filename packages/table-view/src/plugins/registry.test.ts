import { describe, expect, it } from "vitest";

import type { CellPlugin } from "@notion-kit/table-hook/plugins";

import { createPluginRegistry, type TableUiPlugin } from "./registry";

const text: CellPlugin<"text", string, undefined> = {
  id: "text",
  default: { data: "", config: undefined },
  fromValue: (value) => value?.toString() ?? "",
  toValue: (data) => data,
  toTextValue: (data) => data,
  isEmpty: (data) => data.trim() === "",
};

const textUi: TableUiPlugin<typeof text> = {
  id: "text",
  meta: { name: "Text", desc: "", icon: null },
  default: { name: "Text", icon: null },
  renderCell: () => null,
  renderGroupingValue: () => null,
};

describe("createPluginRegistry", () => {
  it("TestCreatePluginRegistry_MatchingIds_ResolvesTheUiAdapter", () => {
    const registry = createPluginRegistry({ data: [text], ui: [textUi] });

    expect(registry.getUiPlugin("text")).toBe(textUi);
  });

  it("TestCreatePluginRegistry_MissingUiAdapter_ThrowsDuringSetup", () => {
    expect(() => createPluginRegistry({ data: [text], ui: [] })).toThrow(
      'Missing UI plugin adapter for data plugin "text"',
    );
  });

  it("TestCreatePluginRegistry_DuplicateUiAdapter_ThrowsDuringSetup", () => {
    expect(() =>
      createPluginRegistry({ data: [text], ui: [textUi, textUi] }),
    ).toThrow('Duplicate UI plugin adapter "text"');
  });
});
