"use client";

import { useIsClient } from "./use-is-client";

export function useOrigin() {
  const isClient = useIsClient();
  return isClient ? window.location.origin : "";
}
