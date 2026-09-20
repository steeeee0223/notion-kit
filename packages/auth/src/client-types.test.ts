import { expectTypeOf, it } from "vitest";

import { createAuthClient } from "./client";

it("preserves official plugin methods in the public client type", () => {
  expectTypeOf(createAuthClient().organization.create).toBeFunction();
  expectTypeOf(createAuthClient().twoFactor.verifyTotp).toBeFunction();
});
