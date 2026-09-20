import { expect, it } from "vitest";

import { resolveAppURL } from "./app-url";

it.each([
  ["/", "https://notes.example.com/"],
  ["/home?tab=recent", "https://notes.example.com/home?tab=recent"],
  ["https://tasks.example.org/home", "https://tasks.example.org/home"],
])("resolves callback %s against the app origin", (path, expected) => {
  expect(resolveAppURL("https://notes.example.com", path)).toBe(expected);
});
