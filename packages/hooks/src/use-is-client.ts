"use client";

import { useEffect, useState } from "react";

import { useMounted } from "./use-mounted";

export function useIsClient() {
  const isMounted = useMounted();
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(typeof window !== "undefined");
  }, [isMounted]);

  return isClient;
}
