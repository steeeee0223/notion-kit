"use client";

import { useMounted } from "./use-mounted";

export function useOrigin() {
  const mounted = useMounted();
  const isClient = typeof window !== "undefined";

  if (!isClient || !mounted) return "";
  return window.location.origin;
}
