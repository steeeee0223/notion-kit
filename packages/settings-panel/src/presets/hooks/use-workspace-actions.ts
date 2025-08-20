"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import { useCopyToClipboard } from "@notion-kit/hooks";
import { toast } from "@notion-kit/shadcn";

import { useSettings } from "../../core";
import { createDefaultFn } from "../../lib";

export function useWorkspaceActions() {
  const {
    settings: { workspace },
    workspace: actions,
  } = useSettings();

  const [, copy] = useCopyToClipboard();
  const copyLink = useCallback(async () => {
    await copy(workspace.inviteLink);
    toast.success("Copied link to clipboard");
  }, [copy, workspace.inviteLink]);

  const { mutateAsync: updateLink, isPending: isResetting } = useMutation({
    mutationFn: actions?.resetLink ?? createDefaultFn(),
    onSuccess: () => toast.success("Workspace link updated"),
    onError: (error) => {
      toast.error("Update workspace link failed", {
        description: error.message,
      });
    },
  });

  return { isResetting, copyLink, updateLink };
}
