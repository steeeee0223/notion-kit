import React, { useCallback, useRef } from "react";

import { cn } from "@notion-kit/cn";

import { useCodeBlock } from "./code-block-provider";

/**
 * CodeBlockContent uses the Shiki playground pattern:
 * - A <span> displays the syntax-highlighted HTML
 * - A transparent <textarea> overlays it for editing
 * - The user types in the textarea but sees the highlighted code
 *
 * Code wrapping is handled via Shiki transformer which applies inline styles
 * directly to the pre/code elements when wrap mode is enabled.
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
        className={cn(
          "flex py-3",
          // In normal mode: horizontal scroll; in wrap mode: hidden overflow to constrain width
          state.wrap ? "overflow-hidden" : "overflow-x-auto",
        )}
      >
        {/* Container for overlay pattern */}
        <div
          className={cn(
            "relative min-h-[1em] shrink grow text-start text-[85%] text-primary",
            // In wrap mode: constrain width so content wraps
            state.wrap && "min-w-0",
          )}
          style={fontStyle}
        >
          {/* Highlighted code display - wrap styles applied via Shiki transformer */}
          <span
            ref={highlightRef}
            aria-hidden="true"
            className="pointer-events-none"
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
            className={cn(
              "absolute inset-0 h-full w-full resize-none bg-transparent p-[inherit] text-transparent caret-primary focus-visible:outline-none",
              state.wrap &&
                "overflow-hidden wrap-anywhere break-all whitespace-pre-wrap",
            )}
            style={fontStyle}
          />
        </div>
      </div>
    </div>
  );
}
