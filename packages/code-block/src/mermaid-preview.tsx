import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

import { cn } from "@notion-kit/cn";

import { useCodeBlock } from "./code-block-provider";

/** Debounce delay for rendering mermaid diagrams (ms) */
const RENDER_DEBOUNCE_MS = 300;

/**
 * Live mermaid diagram preview.
 *
 * Renders the given mermaid source code as an SVG diagram.
 * Uses a debounced render to avoid thrashing while the user is typing.
 */
export function MermaidPreview({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { state } = useCodeBlock();
  const id = useId();
  const mermaidId = `mermaid-${id.replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  // Initialize mermaid once
  useEffect(() => {
    if (!initializedRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily:
          'SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace',
      });
      initializedRef.current = true;
    }
  }, []);

  const renderDiagram = useCallback(
    async (source: string) => {
      if (!source.trim()) {
        setSvg("");
        setError(null);
        return;
      }

      try {
        const { svg: renderedSvg } = await mermaid.render(mermaidId, source);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to render diagram",
        );
      }
    },
    [mermaidId],
  );

  // Debounced rendering on code change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void renderDiagram(state.code);
    }, RENDER_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.code, renderDiagram]);

  if (!state.code.trim()) return null;
  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      {...props}
    >
      {error ? (
        <div className="flex items-start gap-2 text-xs text-red">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      ) : svg ? (
        <div
          className="flex w-full items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center justify-center py-6 text-xs text-muted">
          Rendering diagram...
        </div>
      )}
    </div>
  );
}
