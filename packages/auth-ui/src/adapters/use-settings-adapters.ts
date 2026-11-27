"use client";

import { useCallback, useMemo } from "react";

import type {
  FileUploadPurpose,
  SettingsAdapters,
} from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth, useSession } from "../auth-provider";
import { fileToBase64 } from "../lib/file";
import { useAccountAdapter } from "./use-account-adapter";
import { useBillingAdapter } from "./use-billing-adapter";
import { useConnectionsAdapter } from "./use-connections-adapter";
import { useEmojiAdapter } from "./use-emoji-adapter";
import { useInvitationsAdapter } from "./use-invitations-adapter";
import { usePasskeysAdapter } from "./use-passkeys-adapter";
import { usePeopleAdapter } from "./use-people-adapter";
import { useSessionsAdapter } from "./use-sessions-adapter";
import { useTeamspacesAdapter } from "./use-teamspaces-adapter";
import { useWorkspaceAdapter } from "./use-workspace-adapter";

export function useSettingsAdapters() {
  const { auth } = useAuth();
  const { data: session } = useSession();
  const { data: workspace } = useActiveWorkspace();
  const organizationId = workspace?.id;

  const account = useAccountAdapter();
  const sessions = useSessionsAdapter();
  const passkeys = usePasskeysAdapter();
  const connections = useConnectionsAdapter();
  const workspaceAdapter = useWorkspaceAdapter();
  const people = usePeopleAdapter();
  const invitations = useInvitationsAdapter();
  const teamspaces = useTeamspacesAdapter();
  const emoji = useEmojiAdapter();
  const billing = useBillingAdapter();

  const uploadFile = useCallback(
    async (file: File, purpose: FileUploadPurpose) => {
      if (purpose === "workspace-icon" && !organizationId)
        throw new Error("Select a workspace before uploading a file.");
      const { imageBase64, contentType } = await fileToBase64(file);
      const { data, error } = await auth.fileUpload.upload(
        purpose === "avatar"
          ? { imageBase64, contentType, purpose }
          : {
              organizationId: organizationId!,
              imageBase64,
              contentType,
              purpose,
            },
      );
      if (error) throw new Error(error.message);
      if (purpose === "avatar") {
        await auth.updateUser({ image: data.url }, { throw: true });
        return;
      }
      await auth.organization.update(
        {
          organizationId,
          data: {
            logo: JSON.stringify({ type: "url", src: data.url }),
          },
        },
        { throw: true },
      );
    },
    [auth, organizationId],
  );

  const adapters = useMemo<SettingsAdapters>(
    () => ({
      account,
      sessions,
      passkeys,
      connections,
      workspace: workspaceAdapter,
      people,
      invitations,
      teamspaces,
      emoji,
      billing,
      uploadFile: session ? uploadFile : undefined,
    }),
    [
      account,
      sessions,
      passkeys,
      connections,
      workspaceAdapter,
      people,
      invitations,
      teamspaces,
      emoji,
      billing,
      session,
      uploadFile,
    ],
  );

  return adapters;
}
