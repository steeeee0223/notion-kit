import React, { useLayoutEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { BundledLanguage } from "shiki/bundle/web";
import { codeToHast } from "shiki/bundle/web";

export async function highlight(code: string, lang: BundledLanguage | "text") {
  const out = await codeToHast(code, {
    lang,
    theme: "github-dark",
  });

  return toJsxRuntime(out, {
    Fragment: React.Fragment,
    jsx,
    jsxs,
  }) as React.JSX.Element;
}

interface CodeBlockContentProps extends React.ComponentProps<"div"> {
  lang?: BundledLanguage | "text";
  code?: string;
}

export function CodeBlockContent({
  lang = "text",
  code = "",
  children,
  ...props
}: CodeBlockContentProps) {
  const [nodes, setNodes] = useState<React.ReactNode>(null);

  useLayoutEffect(() => {
    void highlight(code, lang).then(setNodes);
  }, [code, lang]);

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
          {nodes}
          {children}
        </div>
      </div>
    </div>
  );
}
