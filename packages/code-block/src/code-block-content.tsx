import React from "react";

import { useEditableContent } from "./use-code-block-content";

export function CodeBlockContent({ ...props }: React.ComponentProps<"div">) {
  const { props: contentEditableProps } = useEditableContent();

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
          {...contentEditableProps}
        ></div>
      </div>
    </div>
  );
}
