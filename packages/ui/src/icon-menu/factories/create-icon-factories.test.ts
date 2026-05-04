import { describe, expect, it } from "vitest";

import { createIconFactories } from "./create-icon-factories";
import { createIconFactory } from "./create-icon-factory";
import type { IconItem, RenderIconOptions, SelectOptions } from "./types";

function makeFactory(id: string, label: string) {
  return createIconFactory({
    id,
    label,
    icons: [{ id: `${id}-icon-1`, name: `${label} Icon 1`, keywords: [] }],
    renderIcon: (_item: IconItem, _opts: RenderIconOptions) => null,
    toIconData: (item: IconItem, _opts: SelectOptions) => ({
      type: "url" as const,
      src: item.id,
    }),
  });
}

describe("createIconFactories", () => {
  it("should compose multiple factories", () => {
    const factories = createIconFactories({
      providers: [
        makeFactory("emoji", "Emojis"),
        makeFactory("lucide", "Icons"),
      ],
    });

    expect(factories).toHaveLength(2);
    expect(factories[0]!.id).toBe("emoji");
    expect(factories[1]!.id).toBe("lucide");
  });

  it("should warn on duplicate factory IDs but not throw", () => {
    // createIconFactories warns but does not throw
    const factories = createIconFactories({
      providers: [
        makeFactory("my-icons", "Icons A"),
        makeFactory("my-icons", "Icons B"),
      ],
    });
    // Both are returned (warn only)
    expect(factories).toHaveLength(2);
  });

  it("should return empty array for empty input", () => {
    const factories = createIconFactories({ providers: [] });
    expect(factories).toEqual([]);
  });
});
