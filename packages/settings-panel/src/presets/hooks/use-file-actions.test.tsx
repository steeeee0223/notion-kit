import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsProvider } from "@/core/settings-provider";
import type { FileUploadPurpose, SettingsAdapters } from "@/lib/types";

import { initialAccountStore, initialWorkspaceStore } from "./constants";
import { useAccount, useWorkspace } from "./queries";
import { useFileActions } from "./use-file-actions";

describe("TestFileActions", () => {
  it.each<FileUploadPurpose>(["avatar", "workspace-icon"])(
    "%s upload refreshes only the corresponding image",
    async (purpose) => {
      let account = {
        ...initialAccountStore,
        id: "user-1",
        avatarUrl: "old-avatar",
      };
      let workspace = {
        ...initialWorkspaceStore,
        id: "org-1",
        icon: { type: "url" as const, src: "old-icon" },
      };
      const adapters: SettingsAdapters = {
        account: {
          getAll: () => Promise.resolve(account),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve(),
          sendEmailVerification: () => Promise.resolve(),
          changePassword: () => Promise.resolve(),
        },
        workspace: {
          getAll: () => Promise.resolve(workspace),
          update: () => Promise.resolve(),
          delete: () => Promise.resolve(),
          leave: () => Promise.resolve(),
        },
        uploadFile: (_file, destination) => {
          if (destination === "avatar")
            account = { ...account, avatarUrl: "new-avatar" };
          else
            workspace = {
              ...workspace,
              icon: { type: "url", src: "new-icon" },
            };
          return Promise.resolve();
        },
      };
      function Wrapper({ children }: PropsWithChildren) {
        return (
          <SettingsProvider adapters={adapters}>{children}</SettingsProvider>
        );
      }
      const { result } = renderHook(
        () => ({
          account: useAccount(),
          workspace: useWorkspace(),
          actions: useFileActions(purpose),
        }),
        { wrapper: Wrapper },
      );
      await waitFor(() =>
        expect(result.current.account.data.id).toBe("user-1"),
      );
      await waitFor(() =>
        expect(result.current.workspace.data.id).toBe("org-1"),
      );
      await act(() =>
        result.current.actions.upload(new File(["image"], "image.png")),
      );
      await waitFor(() =>
        expect(result.current.account.data.avatarUrl).toBe(
          purpose === "avatar" ? "new-avatar" : "old-avatar",
        ),
      );
      await waitFor(() =>
        expect(result.current.workspace.data.icon.src).toBe(
          purpose === "workspace-icon" ? "new-icon" : "old-icon",
        ),
      );
    },
  );
});
