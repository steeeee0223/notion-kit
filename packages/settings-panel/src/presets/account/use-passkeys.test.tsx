import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SettingsProvider } from "@/core/settings-provider";
import type { SettingsAdapters } from "@/lib/types";

import { usePasskeys } from "./use-passkeys";

function wrapper(adapters: SettingsAdapters) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <SettingsProvider adapters={adapters}>{children}</SettingsProvider>;
  };
}

afterEach(() => vi.restoreAllMocks());

describe("TestPasskeys", () => {
  it("missing passkey adapter reports creation failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(usePasskeys, { wrapper: wrapper({}) });
    act(() => result.current.create());
    await waitFor(() => expect(result.current.error).toBe(true));
  });

  it("a rejected passkey request exposes an error for the modal", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { result } = renderHook(usePasskeys, {
      wrapper: wrapper({
        passkeys: {
          getAll: () => Promise.resolve([]),
          add: () => Promise.reject(new Error("Authenticator unavailable")),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve(),
        },
      }),
    });
    act(() => result.current.create());
    await waitFor(() => expect(result.current.error).toBe(true));
  });
});
