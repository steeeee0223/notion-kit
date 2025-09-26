"use client";

import React, { useCallback, useRef } from "react";

import { useCodeBlock } from "./code-block-provider";

/**
 * CodeBlockContent uses the Shiki playground pattern:
 * - A <span> displays the syntax-highlighted HTML
 * - A transparent <textarea> overlays it for editing
 * - The user types in the textarea but sees the highlighted code
 */
export function CodeBlockContent({ ...props }: React.ComponentProps<"div">) {
  const { state, store } = useCodeBlock();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  // Sync scroll between textarea and highlighted code
  const syncScroll = useCallback(() => {
    if (!highlightRef.current || !textareaRef.current) return;
    const preEl = highlightRef.current.querySelector("pre");
    if (!preEl) return;
    preEl.scrollLeft = textareaRef.current.scrollLeft;
    preEl.scrollTop = textareaRef.current.scrollTop;
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    store.updateCode(e.target.value);
    // Sync scroll after input
    requestAnimationFrame(syncScroll);
  };

  // Common font styles for both textarea and highlighted code
  const fontStyle: React.CSSProperties = {
    fontFamily:
      'SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
    tabSize: 2,
    lineHeight: 1.5,
  };

  return (
    <div
      className="rounded-[10px] bg-[rgba(66,35,3,.031)] p-[22px] dark:bg-default/5"
      {...props}
    >
      <div
        key="line-numbers notion-code-block"
        className="flex overflow-x-auto py-3"
      >
        {/* Container for overlay pattern */}
        <div
          className="relative min-h-[1em] shrink grow text-start text-[85%] whitespace-pre text-primary"
          style={fontStyle}
        >
          {/* Highlighted code display */}
          <span
            ref={highlightRef}
            aria-hidden="true"
            className="pointer-events-none [&>pre]:m-0 [&>pre]:bg-transparent! [&>pre]:p-0 [&>pre]:leading-[inherit] [&>pre>code]:block"
            dangerouslySetInnerHTML={{ __html: state.html }}
          />

          {/* Editable textarea overlay */}
          <textarea
            ref={textareaRef}
            value={state.code}
            onChange={handleInput}
            onScroll={syncScroll}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Code editor"
            className="absolute inset-0 h-full w-full resize-none bg-transparent text-transparent caret-primary focus-visible:outline-none"
            style={{
              ...fontStyle,
              // Match Shiki's default code block padding
              padding: "inherit",
            }}
          />
        </div>
      </div>
    </div>
  );
}
