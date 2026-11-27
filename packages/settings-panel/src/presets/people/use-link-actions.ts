"use client";

import { useCallback } from "react";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { toast } from "@notion-kit/ui/primitives";

import { useSettingsApi } from "@/core";

import { useWorkspace, useWorkspaceActions } from "../hooks";

export function useLinkActions() {
  const { data: workspace } = useWorkspace();
  const { workspace: actions } = useSettingsApi();
  const { isResettingLink, resetLink } = useWorkspaceActions();

  const { copy } = useCopyToClipboard({
    onSuccess: () => toast.success("Copied link to clipboard"),
  });
  const copyLink = useCallback(
    () => copy(workspace.inviteLink),
    [copy, workspace.inviteLink],
  );

  return {
    hasInviteLink: !!workspace.inviteLink && !!actions?.resetLink,
    isResetting: isResettingLink,
    copyLink,
    resetLink,
  };
}
