import { describe, expect, it } from "vitest";

import { createMockTableFixture } from "@/mock";

describe("public table fixtures", () => {
  it("returns fresh deterministic basic table data", () => {
    const first = createMockTableFixture();
    const second = createMockTableFixture();

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.data).not.toBe(second.data);
    expect(first.properties).not.toBe(second.properties);
    expect(first.data[0]?.createdAt).toBe(1_735_689_600_000);

    first.data[0]!.properties.col1!.value = "changed";
    expect(second.data[0]!.properties.col1!.value).toBe("Task 1");
  });
});
