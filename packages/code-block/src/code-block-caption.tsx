import React, { useEffect, useImperativeHandle } from "react";

import { cn } from "@notion-kit/cn";
import { useContentEditable } from "@notion-kit/hooks";

import { useCodeBlock } from "./code-block-provider";

export function CodeBlockCaption({
  ref: externalRef,
  className,
  children: _children,
  ...props
}: React.ComponentProps<"div">) {
  const { state, store, readonly } = useCodeBlock();
  const { ref, props: editableProps } = useContentEditable<HTMLDivElement>({
    readonly,
    value: state.caption ?? "",
    onChange: store.setCaption,
  });

  const placeholder = readonly ? undefined : "Write a caption...";

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
        aria-label="Caption"
        aria-placeholder={placeholder}
        data-placeholder={placeholder}
        data-content-editable-leaf={readonly ? undefined : "true"}
        className={cn(
          "w-full max-w-full py-1.5 pl-0.5 text-sm/[1.4] word-break whitespace-break-spaces text-[rgb(168,164,156)] focus-visible:outline-none",
          !readonly &&
            "caret-primary empty:before:text-[rgb(168,164,156)]/50 empty:before:content-[attr(data-placeholder)]",
          className,
        )}
        onKeyDown={(e) => {
          if (readonly || e.key !== "Backspace") return;
          // Disable caption when pressing Backspace on empty content
          const target = e.target as HTMLDivElement;
          if (target.textContent === "") {
            e.preventDefault();
            store.setCaption(undefined);
          }
        }}
        {...editableProps}
        tabIndex={editableProps.tabIndex}
        {...props}
      />
    </div>
  );
}
