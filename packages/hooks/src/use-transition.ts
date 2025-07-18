"use client";

import { useCallback, useState } from "react";

type Action<T, Args extends unknown[]> =
  | ((...args: Args) => T | undefined)
  | ((...args: Args) => Promise<T | undefined>);

type UseTransitionReturn<T, Args extends unknown[]> = readonly [
  Action<T, Args>,
  boolean,
  Error | undefined,
];

export function useTransition<T, Args extends unknown[]>(
  fn: Action<T, Args>,
  optimisticUpdate?: (args: Args, result?: T) => void,
): UseTransitionReturn<T, Args> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error>();

  const action = useCallback<Action<T, Args>>(
    async (...args) => {
      try {
        setIsPending(true);
        const result = await Promise.resolve(fn(...args));
        optimisticUpdate?.(args, result);
        return result;
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsPending(false);
      }
    },
    [fn, optimisticUpdate],
  );

  return [action, isPending, error] as const;
}
