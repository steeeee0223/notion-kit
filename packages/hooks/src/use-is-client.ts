"use client";

export function useIsClient() {
  return typeof window !== "undefined";
}
