"use client";

import React from "react";

import { CodeBlockProvider } from "./code-block-provider";

function CodeBlock({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <CodeBlockProvider>
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
    </CodeBlockProvider>
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

export { CodeBlock };
