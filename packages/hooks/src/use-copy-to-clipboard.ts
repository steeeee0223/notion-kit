"use client";

import { useCallback, useState } from "react";

import { useIsClient } from "./use-is-client";

export function useCopyToClipboard() {
  const isClient = useIsClient();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string) => {
      if (!isClient) {
        console.warn("Clipboard not supported");
        return false;
      }

      // Try to save to clipboard then save it in the state if worked
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        return false;
      }
    },
    [isClient],
  );

  return [copiedText, copy] as const;
}
