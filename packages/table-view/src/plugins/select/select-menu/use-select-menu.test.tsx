import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColumnInfo, Row } from "@notion-kit/table-hook";

import { TableViewWrapper } from "@/table-contexts";

import { selectConfig } from "../__tests__/utils";
import { useSelectMenu } from "./use-select-menu";

const properties: ColumnInfo[] = [
  {
    id: "status",
    name: "Status",
    type: "select",
    width: "160",
    config: selectConfig,
  },
  {
    id: "tags",
    name: "Tags",
    type: "multi-select",
    width: "160",
    config: selectConfig,
  },
];
const data: Row[] = [
  {
    id: "row",
    createdAt: 0,
    lastEditedAt: 0,
    properties: {
      status: { id: "cell", value: "Option A" },
      tags: { id: "tags-cell", value: ["Option A", "Option B"] },
    },
  },
];

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TableViewWrapper defaultData={data} defaultProperties={properties}>
      {children}
    </TableViewWrapper>
  );
}

function renderSelectMenuHook({
  multi = false,
  options = [] as string[],
} = {}) {
  const onChange = vi.fn();
  const onConfigChange = vi.fn();
  const hook = renderHook(
    (props: { multi: boolean; options: string[] }) =>
      useSelectMenu({
        ...props,
        propId: props.multi ? "tags" : "status",
        config: selectConfig,
        onChange,
        onConfigChange,
      }),
    {
      initialProps: { multi, options },
      wrapper,
    },
  );
  return { ...hook, onChange, onConfigChange };
}

describe("useSelectMenu", () => {
  it("Search_NewAndExistingNames_OnlySuggestsCreatableOption", () => {
    const { result } = renderSelectMenuHook();

    expect(result.current.optionSuggestion).toBeUndefined();
    act(() => result.current.setSearch("Option A"));
    expect(result.current.optionSuggestion).toBeUndefined();
    act(() => result.current.setSearch("Brand new"));
    expect(result.current.optionSuggestion).toMatchObject({
      name: "Brand new",
    });
  });

  it("AddOption_SingleAndMulti_CommitExpectedSelection", () => {
    const single = renderSelectMenuHook();
    act(() => single.result.current.addOption());
    expect(single.onChange).not.toHaveBeenCalled();

    act(() => single.result.current.setSearch("New single"));
    act(() => single.result.current.addOption());
    expect(single.onChange).toHaveBeenLastCalledWith(["New single"]);
    expect(single.onConfigChange).toHaveBeenCalled();
    expect(single.result.current.search).toBe("");

    const multi = renderSelectMenuHook({
      multi: true,
      options: ["Option A"],
    });
    act(() => multi.result.current.setSearch("New multi"));
    act(() => multi.result.current.addOption());
    expect(multi.onChange).toHaveBeenLastCalledWith(["Option A", "New multi"]);
  });

  it("SelectionChanges_SingleMultiAndDuplicate_RespectCardinality", () => {
    const single = renderSelectMenuHook({ options: ["Option A"] });
    act(() => single.result.current.selectTag("Option A"));
    expect(single.onChange).not.toHaveBeenCalled();
    act(() => single.result.current.selectTag("Option B"));
    expect(single.onChange).toHaveBeenLastCalledWith(["Option B"]);

    act(() => single.result.current.handleTagsChange(["Option A", "Option C"]));
    expect(single.onChange).toHaveBeenLastCalledWith(["Option C"]);

    const multi = renderSelectMenuHook({
      multi: true,
      options: ["Option A"],
    });
    act(() => multi.result.current.selectTag("Option B"));
    expect(multi.onChange).toHaveBeenLastCalledWith(["Option A", "Option B"]);
    act(() => multi.result.current.handleTagsChange(["Option A", "Option C"]));
    expect(multi.onChange).toHaveBeenLastCalledWith(["Option A", "Option C"]);
  });

  it("HandleTagsChange_CreatableTag_AddsSearchedOption", () => {
    const { result, onChange } = renderSelectMenuHook();
    act(() => result.current.setSearch("Created"));
    act(() => result.current.handleTagsChange(["Created"]));

    expect(onChange).toHaveBeenLastCalledWith(["Created"]);
  });

  it("OptionValidation_RejectsBlankAndDuplicateNames", () => {
    const { result } = renderSelectMenuHook();

    expect(result.current.validateOptionName("   ")).toBe(false);
    expect(result.current.validateOptionName("Option A")).toBe(false);
    expect(result.current.validateOptionName("Unique")).toBe(true);
  });

  it("UpdateAndDelete_SelectedOptions_KeepCellSelectionInSync", () => {
    const selected = renderSelectMenuHook({
      multi: true,
      options: ["Option A", "Option B"],
    });
    act(() =>
      selected.result.current.updateOption("Option A", {
        name: "Renamed",
        color: "red",
      }),
    );
    expect(selected.onChange).toHaveBeenLastCalledWith(["Renamed", "Option B"]);

    act(() => selected.result.current.deleteOption("Option B"));
    expect(selected.onChange).toHaveBeenLastCalledWith(["Option A"]);

    const unselected = renderSelectMenuHook({ options: [] });
    act(() =>
      unselected.result.current.updateOption("Option A", {
        description: "Updated",
      }),
    );
    act(() => unselected.result.current.deleteOption("Option B"));
    expect(unselected.onChange).not.toHaveBeenCalled();
  });

  it("ReorderAndTags_ExposeConfigOrderAndOptionalColors", () => {
    const { result, onConfigChange } = renderSelectMenuHook({
      options: ["Option A", "Missing"],
    });

    expect(result.current.tags).toEqual([
      { value: "Option A", color: "blue" },
      { value: "Missing", color: undefined },
    ]);

    act(() => result.current.reorderOptions(["Option C", "Option A"]));
    expect(onConfigChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          names: ["Option C", "Option A"],
        }),
      }),
    );
  });
});
