"use client";

import { useCallback, useState } from "react";

import { useIsClient } from "./use-is-client";

interface UseCopyToClipboardOptions {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const isClient = useIsClient();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (!isClient) {
        console.warn("Clipboard not supported");
        return options.onError?.("Clipboard not supported");
      }

      // Try to save to clipboard then save it in the state if worked
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        return options.onSuccess?.();
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        const msg = error instanceof Error ? error.message : String(error);
        return options.onError?.(msg);
      }
    },
    [isClient, options],
  );

  return { copiedText, copy };
}
