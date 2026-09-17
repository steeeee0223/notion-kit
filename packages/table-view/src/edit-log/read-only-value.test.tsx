import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createFullPluginFixture } from "@/__tests__/mock";
import { DEFAULT_PLUGINS, type ReadOnlyValueProps } from "@/plugins";
import { TableViewWrapper } from "@/table-contexts";

import {
  renderReadOnlyValue,
  snapshot,
} from "./__tests__/render-read-only-value";
import { ReadOnlyValue } from "./read-only-value";

describe("ReadOnlyValue", () => {
  it.each(["unknown-historical-type", "text"])(
    "TestReadOnlyValue_%sWithoutRenderer_UsesHistoricalText",
    (type) => {
      renderReadOnlyValue(snapshot(type, { unsupported: true }), {
        ...DEFAULT_PLUGINS,
        ui: DEFAULT_PLUGINS.ui.map((plugin) => ({
          ...plugin,
          renderReadOnlyValue: undefined,
        })),
      });
      expect(screen.getByText("Historical fallback")).toBeVisible();
    },
  );

  it("TestReadOnlyValue_CustomRenderer_ReceivesOnlyHistoricalInputs", () => {
    const record = snapshot("text", "Old value", { version: 1 });
    const renderReadOnlyValue = vi.fn((props: ReadOnlyValueProps) => (
      <span>
        {props.property.name}: {props.textValue}
      </span>
    ));
    render(
      <TableViewWrapper
        {...createFullPluginFixture()}
        plugins={{
          ...DEFAULT_PLUGINS,
          ui: DEFAULT_PLUGINS.ui.map((plugin) =>
            plugin.id === "text" ? { ...plugin, renderReadOnlyValue } : plugin,
          ),
        }}
      >
        <ReadOnlyValue record={record} />
      </TableViewWrapper>,
    );
    expect(renderReadOnlyValue).toHaveBeenCalledWith({
      value: record.value,
      config: record.property.config,
      property: record.property,
      textValue: record.textValue,
    });
    expect(
      screen.getByText("Historical name: Historical fallback"),
    ).toBeVisible();
  });

  it.each(["invocation", "child"])(
    "TestReadOnlyValue_CustomRenderer%sError_OnlyFailingEntryFallsBack",
    (failure) => {
      const error = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const BrokenChild = () => {
        throw new Error("Invalid historical value");
      };
      const broken = (props: ReadOnlyValueProps) => {
        if (props.value === "healthy") return <span>Healthy entry</span>;
        if (failure === "invocation")
          throw new Error("Invalid historical value");
        return <BrokenChild />;
      };
      try {
        render(
          <TableViewWrapper
            {...createFullPluginFixture()}
            plugins={{
              ...DEFAULT_PLUGINS,
              ui: DEFAULT_PLUGINS.ui.map((plugin) =>
                plugin.id === "text"
                  ? { ...plugin, renderReadOnlyValue: broken }
                  : plugin,
              ),
            }}
          >
            <ReadOnlyValue record={snapshot("text", "broken")} />
            <ReadOnlyValue
              record={{ ...snapshot("text", "healthy"), id: "healthy" }}
            />
          </TableViewWrapper>,
        );
        expect(screen.getByText("Historical fallback")).toBeVisible();
        expect(screen.getByText("Healthy entry")).toBeVisible();
      } finally {
        error.mockRestore();
      }
    },
  );
});
