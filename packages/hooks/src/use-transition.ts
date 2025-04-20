"use client";

import { useCallback, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action<T, Args extends any[]> =
  | ((...args: Args) => T)
  | ((...args: Args) => Promise<T>);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTransition<T, Args extends any[]>(fn: Action<T, Args>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();

  const action = useCallback<Action<T | undefined, Args>>(
    async (...args) => {
      try {
        setIsPending(true);
        const response = fn(...args);
        if (response instanceof Promise) return await response;
        return response;
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsPending(false);
      }
    },
    [fn],
  );

  return [action, isPending, error] as const;
}
