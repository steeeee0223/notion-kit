import React, { useEffect, useImperativeHandle } from "react";

import { cn } from "@notion-kit/cn";
import { useContentEditable } from "@notion-kit/hooks";

import { useCodeBlock } from "./code-block-provider";

export function CodeBlockCaption({
  ref: externalRef,
  className,
  children: _children, // Excluded - using dangerouslySetInnerHTML instead
  ...props
}: React.ComponentProps<"div">) {
  const { state, store } = useCodeBlock();

  const { ref, props: editableProps } = useContentEditable<HTMLDivElement>({
    value: state.caption ?? "",
    onChange: store.setCaption,
  });

  // Combine refs
  useImperativeHandle(externalRef, () => ref.current!, [ref]);

  // Listen for focus event from toolbar
  useEffect(() => {
    const handleFocus = () => ref.current?.focus();
    document.addEventListener("code-block:focus-caption", handleFocus);
    return () => {
      document.removeEventListener("code-block:focus-caption", handleFocus);
    };
  }, [ref]);

  if (state.caption === undefined) return null;
  return (
    <div className="relative pr-26">
      <div
        ref={ref}
        role="textbox"
        spellCheck="true"
        aria-placeholder="Write a caption..."
        contentEditable="true"
        data-content-editable-leaf="true"
        data-placeholder="Write a caption..."
        tabIndex={0}
        aria-label="Caption"
        className={cn(
          "w-full max-w-full py-1.5 pl-0.5 text-sm/[1.4] word-break whitespace-break-spaces text-[rgb(168,164,156)] caret-primary focus-visible:outline-none",
          "empty:before:text-[rgb(168,164,156)]/50 empty:before:content-[attr(data-placeholder)]",
          className,
        )}
        onKeyDown={(e) => {
          // Disable caption when pressing Backspace on empty content
          if (e.key === "Backspace") {
            const target = e.target as HTMLDivElement;
            if (target.textContent === "") {
              e.preventDefault();
              store.setCaption(undefined);
            }
          }
        }}
        {...editableProps}
        {...props}
      />
    </div>
  );
}
