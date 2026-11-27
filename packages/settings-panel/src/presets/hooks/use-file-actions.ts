"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@notion-kit/ui/primitives";

import { useSettingsApi } from "../../core";
import {
  QUERY_KEYS,
  unsupportedOperation,
  type FileUploadPurpose,
} from "../../lib";

export function useFileActions(purpose: FileUploadPurpose) {
  const queryClient = useQueryClient();
  const { uploadFile } = useSettingsApi();

  const { mutateAsync: upload, isPending: isUploading } = useMutation({
    mutationFn: (file: File) =>
      uploadFile?.(file, purpose) ?? unsupportedOperation(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey:
          purpose === "avatar"
            ? QUERY_KEYS.account("")
            : QUERY_KEYS.workspace(""),
      }),
    onError: (e) =>
      toast.error("Upload file failed", { description: e.message }),
  });

  return { isUploading, upload };
}
