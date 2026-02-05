import type { ShikiTransformer } from "shiki";

import { cn } from "@notion-kit/cn";

/**
 * Creates a Shiki transformer that applies code wrapping styles to the pre and code elements.
 * When enabled, this transformer adds inline styles and CSS classes to enable text wrapping.
 */
export function createWrapTransformer(enabled?: boolean): ShikiTransformer {
  return {
    name: "wrap-code",
    pre(node) {
      this.addClassToHast(
        node,
        cn(
          "m-0 bg-transparent! p-0 leading-[inherit]",
          enabled && "wrap-anywhere break-all whitespace-pre-wrap",
        ),
      );
    },
    code(node) {
      this.addClassToHast(
        node,
        cn("block", enabled && "break-all whitespace-pre-wrap"),
      );
    },
  };
}
