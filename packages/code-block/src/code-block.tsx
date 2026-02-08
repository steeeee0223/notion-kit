import React from "react";

import { cn } from "@notion-kit/cn";

import type {
  CodeBlockProviderProps,
  CodeBlockValue,
} from "./code-block-provider";
import { CodeBlockProvider } from "./code-block-provider";

interface CodeBlockProps
  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue">,
    CodeBlockProviderProps {}

/**
 * Code block component with syntax highlighting.
 *
 * Supports both controlled and uncontrolled modes:
 *
 * @example Uncontrolled (default)
 * ```tsx
 * <CodeBlock defaultValue={{ code: "const x = 1;", lang: "javascript" }}>
 *   <CodeBlockLang />
 *   <CodeBlockToolbar />
 *   <CodeBlockContent />
 *   <CodeBlockCaption />
 * </CodeBlock>
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [value, setValue] = useState<CodeBlockValue>({
 *   code: "const x = 1;",
 *   lang: "javascript",
 * });
 *
 * <CodeBlock value={value} onChange={setValue}>
 *   <CodeBlockLang />
 *   <CodeBlockToolbar />
 *   <CodeBlockContent />
 *   <CodeBlockCaption />
 * </CodeBlock>
 * ```
 */
function CodeBlock({
  value,
  defaultValue,
  readonly,
  className,
  children,
  onChange,
  ...props
}: CodeBlockProps) {
  return (
    <CodeBlockProvider
      readonly={readonly}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
    >
      <div data-slot="code-block-wrapper" className={cn("flex", className)}>
        <div
          contentEditable={false}
          data-content-editable-void="true"
          role="figure"
          aria-labelledby={props.id}
          data-slot="code-block"
          className="group/code-block relative w-full min-w-0 grow rounded-[10px] text-start"
          {...props}
        >
          {children}
        </div>
      </div>
    </CodeBlockProvider>
  );
}

export { CodeBlock };
export type { CodeBlockValue, CodeBlockProps };
