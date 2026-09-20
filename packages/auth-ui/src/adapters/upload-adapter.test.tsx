import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSettingsAdapters } from "./use-settings-adapters";

const state = vi.hoisted(() => ({
  organizationId: undefined as string | undefined,
  upload: vi.fn(),
  getSession: vi.fn(),
  listAccounts: vi.fn(),
  updateUser: vi.fn(),
  updateOrganization: vi.fn(),
}));
vi.mock("../auth-provider", () => ({
  useAuth: () => ({
    auth: {
      getSession: state.getSession,
      listAccounts: state.listAccounts,
      fileUpload: { upload: state.upload },
      updateUser: state.updateUser,
      organization: { update: state.updateOrganization },
      organizationExtra: {},
      subscription: {},
      stripeExtra: {},
      passkey: {},
    },
  }),
  useSession: () => ({
    data: {
      user: { id: "user-1", name: "Ada", email: "ada@example.test" },
      session: { id: "session-1" },
    },
  }),
  useActiveWorkspace: () => ({
    data: state.organizationId ? { id: state.organizationId } : null,
  }),
}));
beforeEach(() => {
  vi.resetAllMocks();
  state.organizationId = undefined;
  state.upload.mockResolvedValue({
    data: { url: "https://storage.test/image.png" },
    error: null,
  });
  state.updateUser.mockResolvedValue({ data: { status: true }, error: null });
  state.updateOrganization.mockResolvedValue({ data: {}, error: null });
});

describe("TestUploadAdapter", () => {
  it.each([undefined, "org-1"])(
    "avatar upload with workspace %s updates only the current account image",
    async (organizationId) => {
      state.organizationId = organizationId;
      const { result } = renderHook(useSettingsAdapters);
      await result.current.uploadFile!(
        new File(["image"], "avatar.png", { type: "image/png" }),
        "avatar",
      );
      expect(state.upload).toHaveBeenCalledWith({
        purpose: "avatar",
        imageBase64: "aW1hZ2U=",
        contentType: "image/png",
      });
      expect(state.updateUser).toHaveBeenCalledWith(
        { image: "https://storage.test/image.png" },
        { throw: true },
      );
      expect(state.updateOrganization).not.toHaveBeenCalled();
    },
  );
  it("workspace uploads update only the selected organization logo", async () => {
    state.organizationId = "org-1";
    const { result } = renderHook(useSettingsAdapters);
    await result.current.uploadFile!(
      new File(["image"], "icon.png", { type: "image/png" }),
      "workspace-icon",
    );
    expect(state.upload).toHaveBeenCalledWith({
      organizationId: "org-1",
      purpose: "workspace-icon",
      imageBase64: "aW1hZ2U=",
      contentType: "image/png",
    });
    expect(state.updateOrganization).toHaveBeenCalledWith(
      {
        organizationId: "org-1",
        data: { logo: '{"type":"url","src":"https://storage.test/image.png"}' },
      },
      { throw: true },
    );
    expect(state.updateUser).not.toHaveBeenCalled();
  });
  it("avatar upload failure never updates either image", async () => {
    state.upload.mockResolvedValue({
      data: null,
      error: { message: "Upload rejected" },
    });
    const { result } = renderHook(useSettingsAdapters);
    await expect(
      result.current.uploadFile!(
        new File(["image"], "avatar.png", { type: "image/png" }),
        "avatar",
      ),
    ).rejects.toThrow("Upload rejected");
    expect(state.updateUser).not.toHaveBeenCalled();
    expect(state.updateOrganization).not.toHaveBeenCalled();
  });
});

it("account reload uses fresh server image while the session hook still has old data", async () => {
  state.getSession.mockResolvedValue({
    data: {
      user: {
        id: "user-1",
        name: "Ada",
        email: "ada@example.test",
        image: "https://storage.test/new.png",
      },
      session: { id: "session-1" },
    },
    error: null,
  });
  state.listAccounts.mockResolvedValue({ data: [], error: null });
  const { result } = renderHook(useSettingsAdapters);
  expect((await result.current.account!.getAll()).avatarUrl).toBe(
    "https://storage.test/new.png",
  );
});
