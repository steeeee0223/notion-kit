import { describe, expect, it } from "vitest";

import {
  getConfigAdminToken,
  redactCredentials,
  validateCredentialKey,
} from "./config";

describe("config service helpers", () => {
  it("uses the full configured admin token as the config row id", () => {
    expect(getConfigAdminToken("local.secret-value")).toBe(
      "local.secret-value",
    );
    expect(getConfigAdminToken("ci.abc.def")).toBe("ci.abc.def");
    expect(getConfigAdminToken("production.token")).toBe("production.token");
  });

  it("falls back to admin only when the server has no admin token", () => {
    expect(getConfigAdminToken(undefined)).toBe("admin");
  });

  it("rejects invalid credential keys", () => {
    expect(() => validateCredentialKey("tdx_api_key")).not.toThrow();
    expect(() => validateCredentialKey("TDX_API_KEY")).toThrow(
      "Credential keys must use lowercase snake_case",
    );
    expect(() => validateCredentialKey("__proto__")).toThrow(
      "Credential key is not allowed",
    );
  });

  it("redacts credential values and reports presence", () => {
    expect(
      redactCredentials({
        transit_api_key: "abc123",
        tdx_api_key: "",
        bkk_api_key: null,
      }),
    ).toEqual({
      transit_api_key: { present: true },
      tdx_api_key: { present: false },
      bkk_api_key: { present: false },
    });
  });
});
