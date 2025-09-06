"use client";

import { useCallback } from "react";

export function useTemporaryFix() {
  /**
   * temporary fix
   * @see https://github.com/radix-ui/primitives/issues/1241
   */
  const onCloseAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    document.body.style.pointerEvents = "";
  }, []);

  return { onCloseAutoFocus };
}
