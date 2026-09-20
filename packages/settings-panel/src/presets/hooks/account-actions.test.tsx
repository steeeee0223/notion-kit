import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsProvider } from "@/core/settings-provider";
import type {
  AccountAdapter,
  AccountStore,
  SettingsAdapters,
} from "@/lib/types";

import { useAccount } from "./queries";
import { useAccountActions } from "./use-account-actions";

function wrapper(adapters: SettingsAdapters) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <SettingsProvider adapters={adapters}>{children}</SettingsProvider>;
  };
}

const initialAccount: AccountStore = {
  id: "account-1",
  name: "Ada",
  email: "ada@example.com",
  avatarUrl: "",
  preferredName: "Ada",
  hasPassword: false,
};

function accountAdapter(getAll: AccountAdapter["getAll"]): AccountAdapter {
  return {
    getAll,
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    sendEmailVerification: () => Promise.resolve(),
    changePassword: () => Promise.resolve(),
  };
}

describe("TestAccountActions", () => {
  it("missing password capability rejects without changing account state", async () => {
    const { result } = renderHook(
      () => ({ account: useAccount(), actions: useAccountActions() }),
      {
        wrapper: wrapper({
          account: accountAdapter(() => Promise.resolve(initialAccount)),
        }),
      },
    );
    await waitFor(() =>
      expect(result.current.account.data.id).toBe("account-1"),
    );
    await act(async () => {
      await expect(
        result.current.actions.setPassword("new-password"),
      ).rejects.toThrow();
    });
    expect(result.current.account.data.hasPassword).toBe(false);
  });

  it("password completion refreshes account state from the adapter", async () => {
    let account = initialAccount;
    const adapter = accountAdapter(() => Promise.resolve(account));
    adapter.setPassword = () => {
      account = { ...account, hasPassword: true };
      return Promise.resolve();
    };
    const { result } = renderHook(
      () => ({ account: useAccount(), actions: useAccountActions() }),
      {
        wrapper: wrapper({ account: adapter }),
      },
    );
    await waitFor(() =>
      expect(result.current.account.data.id).toBe("account-1"),
    );
    await act(() => result.current.actions.setPassword("new-password"));
    await waitFor(() =>
      expect(result.current.account.data.hasPassword).toBe(true),
    );
  });

  it("missing account adapter rejects account deletion", async () => {
    const { result } = renderHook(useAccountActions, { wrapper: wrapper({}) });
    await act(async () => {
      await expect(
        result.current.remove({
          accountId: "account-1",
          email: "ada@example.com",
        }),
      ).rejects.toThrow();
    });
  });
});
