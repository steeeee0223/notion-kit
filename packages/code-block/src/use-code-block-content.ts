"use client";

import React, { useCallback, useMemo, useRef } from "react";

import { useCodeBlock } from "./code-block-provider";

export function useEditableContent() {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const { store, state } = useCodeBlock();

  const clear = useCallback(async () => {
    await store.updateHtml({ code: "" });
    if (!contentEditableRef.current) return;

    contentEditableRef.current.innerHTML = "";
  }, [store]);

  const props = useMemo<React.ComponentProps<"div">>(() => {
    return {
      "data-block-id": state.blockId,
      contentEditable: true,
      ref: contentEditableRef,
      dangerouslySetInnerHTML: {
        __html: state.html,
      },
      onInput: (e) => {
        const text = e.currentTarget.innerText;
        void store.updateHtml({ code: text });
      },
      onPaste: (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        const code = store.getSnapshot().code + text;
        void store.updateHtml({ code });
      },
    };
  }, [state, store]);

  return { props, clear };
}
