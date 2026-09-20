import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAccountAdapter } from "./use-account-adapter";
import { useBillingAdapter } from "./use-billing-adapter";
import { useConnectionsAdapter } from "./use-connections-adapter";
import { useEmojiAdapter } from "./use-emoji-adapter";
import { useInvitationsAdapter } from "./use-invitations-adapter";
import { usePasskeysAdapter } from "./use-passkeys-adapter";
import { usePeopleAdapter } from "./use-people-adapter";
import { useSessionsAdapter } from "./use-sessions-adapter";
import { useSettingsAdapters } from "./use-settings-adapters";
import { useTeamspacesAdapter } from "./use-teamspaces-adapter";
import { useWorkspaceAdapter } from "./use-workspace-adapter";

const state = vi.hoisted(() => ({
  language: "en",
  read: vi.fn(),
  upload: vi.fn(),
  addTeamMember: vi.fn(),
  updateTeamMember: vi.fn(),
  listAccounts: vi.fn(),
  accountInfo: vi.fn(),
  unlinkAccount: vi.fn(),
  listSessions: vi.fn(),
  addPasskey: vi.fn(),
  listUserPasskeys: vi.fn(),
  getWorkspaceDetail: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({
    appURL: "https://notes.example.com",
    billingReturnURL: "https://notes.example.com/settings/billing",
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            user: {
              id: "user-1",
              name: "Ada",
              email: "ada@example.com",
              lang: state.language,
            },
            session: { id: "session-1" },
          },
          error: null,
        }),
      listAccounts: state.listAccounts,
      accountInfo: state.accountInfo,
      unlinkAccount: state.unlinkAccount,
      listSessions: state.listSessions,
      passkey: {
        addPasskey: state.addPasskey,
        listUserPasskeys: state.listUserPasskeys,
      },
      organization: {
        listMembers: state.read,
        addTeamMember: state.addTeamMember,
      },
      emoji: { list: state.read },
      fileUpload: { upload: state.upload },
      subscription: { list: state.read },
      stripeExtra: { getCustomer: state.read },
      organizationExtra: {
        getWorkspaceDetail: state.getWorkspaceDetail,
        updateTeamMember: state.updateTeamMember,
        listTeamsWithMembers: state.read,
        listInvitationsWithInviter: state.read,
      },
    },
  }),
  useSession: () => ({
    data: {
      user: {
        id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        lang: state.language,
      },
      session: { id: "session-1" },
    },
  }),
  useActiveWorkspace: () => ({
    data: { id: "org-1", name: "Notes", slug: "notes" },
  }),
}));
vi.mock("../lib", () => ({ handleError: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  state.language = "en";
});

describe("AuthAdapters", () => {
  it("derives password availability from credential accounts", async () => {
    state.listAccounts.mockResolvedValue({
      data: [{ providerId: "google" }],
      error: null,
    });
    const { result } = renderHook(() => useAccountAdapter());
    expect((await result.current!.getAll()).hasPassword).toBe(false);
    state.listAccounts.mockResolvedValue({
      data: [{ providerId: "credential" }],
      error: null,
    });
    expect((await result.current!.getAll()).hasPassword).toBe(true);
  });
  it("reports successful passkey creation", async () => {
    state.addPasskey.mockResolvedValue({
      data: { id: "passkey-1" },
      error: null,
    });
    const { result } = renderHook(() => usePasskeysAdapter());
    await expect(result.current.add()).resolves.toBe(true);
  });
  it("does not turn a passkey failure into success", async () => {
    state.addPasskey.mockResolvedValue({
      data: null,
      error: { message: "Registration rejected", code: "UNKNOWN_ERROR" },
    });
    const { result } = renderHook(() => usePasskeysAdapter());
    await expect(result.current.add()).rejects.toThrow("Registration rejected");
  });
  it("does not turn session read errors into an empty device list", async () => {
    state.listSessions.mockResolvedValue({
      data: null,
      error: { message: "Session expired" },
    });
    const { result } = renderHook(() => useSessionsAdapter());
    await expect(result.current.getAll()).rejects.toThrow("Session expired");
  });
  it("does not invent workspace owner privileges when the request fails", async () => {
    state.getWorkspaceDetail.mockResolvedValue({
      data: null,
      error: { message: "Forbidden" },
    });
    const { result } = renderHook(() => useWorkspaceAdapter());
    await expect(result.current!.getAll()).rejects.toThrow("Forbidden");
  });
});

it("loads social profiles by local account ID without querying credential profiles", async () => {
  state.listAccounts.mockResolvedValue({
    data: [
      {
        id: "local-password",
        providerId: "credential",
        accountId: "user-1",
        scopes: [],
      },
      {
        id: "local-google",
        providerId: "google",
        accountId: "remote-google",
        scopes: ["email"],
      },
    ],
    error: null,
  });
  state.accountInfo.mockImplementation(
    ({ query }: { query: { accountId: string } }) =>
      Promise.resolve(
        query.accountId === "local-google"
          ? { data: { user: { name: "Ada" } }, error: null }
          : { data: null, error: { message: "Wrong account selector" } },
      ),
  );
  const { result } = renderHook(() => useConnectionsAdapter());
  await expect(result.current.getAll()).resolves.toEqual([
    {
      id: "local-google",
      connection: {
        type: "google-drive",
        account: "Ada",
        accountId: "remote-google",
      },
      scopes: ["email"],
    },
  ]);
  expect(state.accountInfo).toHaveBeenCalledTimes(1);
});
it("unlinks the selected local account instead of the provider-side ID", async () => {
  state.unlinkAccount.mockImplementation(
    ({ accountId }: { accountId: string }) =>
      accountId === "local-google"
        ? Promise.resolve()
        : Promise.reject(new Error("Wrong account selector")),
  );
  const { result } = renderHook(() => useConnectionsAdapter());
  await expect(
    result.current.delete({
      id: "local-google",
      connection: {
        type: "google-drive",
        account: "Ada",
        accountId: "remote-google",
      },
      scopes: [],
    }),
  ).resolves.toBeUndefined();
});
it("derives session device details from the official user agent field", async () => {
  state.listSessions.mockResolvedValue({
    data: [
      {
        id: "session-1",
        token: "token",
        updatedAt: new Date(0),
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
        ipAddress: "203.0.113.7",
      },
    ],
    error: null,
  });
  const { result } = renderHook(() => useSessionsAdapter());
  await expect(result.current.getAll()).resolves.toEqual([
    {
      id: "session-1",
      token: "token",
      lastActive: 0,
      device: "Apple, iPhone",
      type: "mobile",
      location: "203.0.113.7",
    },
  ]);
});

it.each([
  ["emoji", useEmojiAdapter],
  ["invitations", useInvitationsAdapter],
  ["people", usePeopleAdapter],
  ["teamspaces", useTeamspacesAdapter],
  ["billing", useBillingAdapter],
] as const)(
  "propagates %s read errors instead of empty success",
  async (_name, hook) => {
    state.read.mockResolvedValue({
      data: null,
      error: { message: "Forbidden" },
    });
    const { result } = renderHook(() => hook());
    await expect(result.current!.getAll()).rejects.toThrow("Forbidden");
  },
);

it("loads every member page using explicit organization scope", async () => {
  state.read.mockImplementation(
    ({ query }: { query: { organizationId: string; offset?: number } }) =>
      Promise.resolve({
        data: {
          total: 2,
          members: [
            {
              id: query.offset ? "member-2" : "member-1",
              role: "member",
              user: {
                id: query.offset ? "user-2" : "user-1",
                name: "Ada",
                email: "ada@example.com",
              },
            },
          ],
        },
        error: null,
      }),
  );
  const { result } = renderHook(() => usePeopleAdapter());
  expect(Object.keys(await result.current!.getAll())).toEqual([
    "user-1",
    "user-2",
  ]);
  expect(state.read).toHaveBeenLastCalledWith({
    query: { organizationId: "org-1", limit: 100, offset: 1 },
  });
});

it("does not write a team role after official membership creation fails", async () => {
  state.addTeamMember.mockRejectedValue(new Error("Team is full"));
  const { result } = renderHook(() => useTeamspacesAdapter());
  await expect(
    result.current!.addMembers({
      teamspaceId: "team-1",
      userIds: ["new-user"],
      role: "owner",
    }),
  ).rejects.toThrow("Team is full");
  expect(state.updateTeamMember).not.toHaveBeenCalled();
  expect(state.addTeamMember).toHaveBeenCalledWith(
    { organizationId: "org-1", teamId: "team-1", userId: "new-user" },
    { throw: true },
  );
});

it("treats WebAuthn ceremony cancellation as an incomplete registration", async () => {
  state.addPasskey.mockResolvedValue({
    data: null,
    error: {
      code: "ERROR_CEREMONY_ABORTED",
      message: "Registration cancelled",
    },
  });
  const { result } = renderHook(() => usePasskeysAdapter());
  await expect(result.current.add()).resolves.toBe(false);
});

it("displays the highest validated organization role for a multi-role membership", async () => {
  state.getWorkspaceDetail.mockResolvedValue({
    data: {
      id: "org-1",
      name: "Notes",
      slug: "notes",
      logo: null,
      metadata: null,
      role: "member,admin",
      plan: "free",
    },
    error: null,
  });
  const { result } = renderHook(() => useWorkspaceAdapter());
  expect((await result.current!.getAll()).role).toBe("admin");
});

it("rejects unknown roles rather than silently granting a display role", async () => {
  state.getWorkspaceDetail.mockResolvedValue({
    data: {
      id: "org-1",
      name: "Notes",
      slug: "notes",
      logo: null,
      metadata: null,
      role: "owner,unknown",
      plan: "free",
    },
    error: null,
  });
  const { result } = renderHook(() => useWorkspaceAdapter());
  await expect(result.current!.getAll()).rejects.toThrow();
});

it("waits for all membership changes before reporting a partial batch failure", async () => {
  let finishSecond = () => {
    return;
  };
  const second = new Promise<void>((resolve) => {
    finishSecond = resolve;
  });
  state.addTeamMember
    .mockRejectedValueOnce(new Error("First member rejected"))
    .mockReturnValueOnce(second);
  const { result } = renderHook(() => useTeamspacesAdapter());
  let finished = false;
  const operation = result
    .current!.addMembers({
      teamspaceId: "team-1",
      userIds: ["user-2", "user-3"],
      role: "member",
    })
    .catch((error: unknown) => {
      finished = true;
      return error;
    });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(finished).toBe(false);
  finishSecond();
  await expect(operation).resolves.toMatchObject({
    message: "First member rejected",
  });
});

it("reports an upload failure instead of silently leaving the workspace unchanged", async () => {
  state.upload.mockResolvedValue({
    data: null,
    error: { message: "Storage unavailable" },
  });
  const file = new File(["image"], "icon.png", { type: "image/png" });
  Object.defineProperty(file, "arrayBuffer", {
    value: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
  });
  const { result } = renderHook(() => useSettingsAdapters());
  await expect(
    result.current.uploadFile!(file, "workspace-icon"),
  ).rejects.toThrow("Storage unavailable");
});

it("rejects an unknown saved language instead of asserting it is supported", async () => {
  state.language = "unsupported-language";
  state.listAccounts.mockResolvedValue({ data: [], error: null });
  const { result } = renderHook(() => useAccountAdapter());
  await expect(result.current!.getAll()).rejects.toThrow();
  state.language = "en";
});

it("shows empty billing details for a new organization without a Stripe customer", async () => {
  state.read
    .mockResolvedValueOnce({ data: [], error: null })
    .mockResolvedValueOnce({ data: null, error: null });
  const { result } = renderHook(() => useBillingAdapter());
  await expect(result.current!.getAll()).resolves.toEqual({
    billingEmail: undefined,
    billedTo: undefined,
    upcomingInvoice: undefined,
  });
});
