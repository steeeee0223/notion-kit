import { describe, expect, it } from "vitest";

import { decodeRepeatedly, scopedIdSchema } from "./schemas";

describe("scoped ID schemas", () => {
  it("accepts plain scoped IDs", () => {
    expect(scopedIdSchema.parse("f-u2m-bkk:123")).toBe("f-u2m-bkk:123");
  });

  it("decodes once-encoded scoped IDs", () => {
    expect(scopedIdSchema.parse("f-u2m-bkk%3A123")).toBe("f-u2m-bkk:123");
  });

  it("decodes twice-encoded scoped IDs", () => {
    expect(scopedIdSchema.parse("f-u2m-bkk%253A123")).toBe("f-u2m-bkk:123");
  });

  it("does not throw on malformed percent input", () => {
    expect(decodeRepeatedly("f-u2m-bkk%3")).toBe("f-u2m-bkk%3");
  });

  it("decodes other reserved characters that can appear inside GTFS IDs", () => {
    expect(scopedIdSchema.parse("f-u2m-bkk%3Aroute%2Fblue%3A1")).toBe(
      "f-u2m-bkk:route/blue:1",
    );
  });
});
