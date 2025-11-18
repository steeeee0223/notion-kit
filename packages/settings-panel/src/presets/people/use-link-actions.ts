"use client";

import { useCallback } from "react";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { toast } from "@notion-kit/shadcn";

import { useWorkspace, useWorkspaceActions } from "../hooks";

export function useLinkActions() {
  const { data: workspace } = useWorkspace();
  const { isResettingLink, resetLink } = useWorkspaceActions();

  const [, copy] = useCopyToClipboard();
  const copyLink = useCallback(async () => {
    await copy(workspace.inviteLink);
    toast.success("Copied link to clipboard");
  }, [copy, workspace.inviteLink]);

  return { isResetting: isResettingLink, copyLink, resetLink };
}
