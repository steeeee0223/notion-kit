"use client";

import { useCallback, useMemo } from "react";

import type { SettingsAdapters } from "@notion-kit/settings-panel";

import { useActiveWorkspace, useAuth } from "../auth-provider";
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

async function fileToBase64(
  file: File,
): Promise<{ imageBase64: string; contentType: string }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return { imageBase64: btoa(binary), contentType: file.type };
}

export function useSettingsAdapters() {
  const { auth } = useAuth();
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
    async (file: File) => {
      if (!organizationId) return;
      const { imageBase64, contentType } = await fileToBase64(file);
      const { data } = await auth.fileUpload.upload({
        organizationId,
        imageBase64,
        contentType,
        purpose: "workspace-icon",
      });
      if (data?.url) {
        await auth.organization.update(
          {
            organizationId,
            data: {
              logo: JSON.stringify({ type: "url", src: data.url }),
            },
          },
          { throw: true },
        );
      }
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
      uploadFile: organizationId ? uploadFile : undefined,
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
      organizationId,
      uploadFile,
    ],
  );

  return adapters;
}
