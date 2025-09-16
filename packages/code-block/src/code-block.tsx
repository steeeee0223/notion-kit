"use client";

import React from "react";

function CodeBlock({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="flex">
      <div
        contentEditable={false}
        data-content-editable-void="true"
        role="figure"
        aria-labelledby={props.id}
        className="group/code-block relative w-full min-w-0 grow rounded-[10px] text-start"
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function CodeBlockCaption({ children, ...props }: React.ComponentProps<"div">) {
  if (!children) return null;
  return (
    <div className="pr-[105px]">
      <div className="relative">
        <div
          role="textbox"
          id={props.id}
          spellCheck="true"
          aria-placeholder="Write a caption…"
          contentEditable="true"
          data-content-editable-leaf="true"
          tabIndex={0}
          aria-label="Start typing to edit text"
          className="w-full max-w-full py-1.5 pl-0.5 text-sm/[1.4] word-break whitespace-break-spaces text-[rgb(168,164,156)] caret-primary focus-visible:outline-none"
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function CodeBlockContent({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="rounded-[10px] p-[22px] dark:bg-default/5" {...props}>
      <div
        key="line-numbers notion-code-block"
        className="flex overflow-x-auto py-3"
      >
        <div
          role="textbox"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          aria-placeholder=" "
          contentEditable="true"
          data-content-editable-leaf="true"
          tabIndex={0}
          aria-label="Start typing to edit text"
          className="min-h-[1em] shrink grow text-start text-[85%] whitespace-pre text-primary focus-visible:outline-none"
          style={{
            fontFamily:
              'SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
            tabSize: 2,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * @usage
 * import { CodeBlock } from "@notion-kit/code-block"
 * ...
 * <CodeBlock>
 * <CodeBlockLang />
 * <CodeBlockToolbar />
 * <CodeBlockContent />
 * <CodeBlockCaption />
 * </CodeBlock>
 */

export { CodeBlock, CodeBlockContent, CodeBlockCaption };
