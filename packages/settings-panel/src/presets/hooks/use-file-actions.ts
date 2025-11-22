"use client";

import { useMutation } from "@tanstack/react-query";

import { toast } from "@notion-kit/shadcn";

import { useSettingsApi } from "../../core";
import { createDefaultFn } from "../../lib";

export function useFileActions() {
  const { uploadFile } = useSettingsApi();

  const { mutateAsync: upload, isPending: isUploading } = useMutation({
    mutationFn: uploadFile ?? createDefaultFn(),
    onError: (e) =>
      toast.error("Upload file failed", { description: e.message }),
  });

  return { isUploading, upload };
}
