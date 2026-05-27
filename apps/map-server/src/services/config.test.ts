import { describe, expect, it } from "vitest";

import {
  getConfigUserFromToken,
  redactCredentials,
  validateCredentialKey,
} from "./config";

describe("config service helpers", () => {
  it("uses the token prefix as the config user", () => {
    expect(getConfigUserFromToken("local.secret-value")).toBe("local");
    expect(getConfigUserFromToken("ci.abc.def")).toBe("ci");
    expect(getConfigUserFromToken("production.token")).toBe("production");
  });

  it("falls back to admin when the token has no user prefix", () => {
    expect(getConfigUserFromToken("plain-token")).toBe("admin");
    expect(getConfigUserFromToken(undefined)).toBe("admin");
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
