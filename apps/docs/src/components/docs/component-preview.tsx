import React from "react";
import { Index } from "@/__registry__/demos";
import { CodeBlock } from "@/components/docs/code-block";
import { getFileSource } from "@/lib/get-file-source";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { SlidersHorizontalIcon } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Button, ThemeProvider } from "@notion-kit/shadcn";

import {
  ComponentWrapper,
  ResizableContainer,
} from "./component-preview-client";

export interface ComponentPreviewProps {
  name: string;
  containerClassName?: string;
  className?: string;
  preview?: string;
  expandable?: boolean;
  fullWidth?: boolean;
  resizable?: boolean;
  suspense?: boolean;
  primary?: boolean;
}

export const ComponentPreview = async ({
  name,
  containerClassName,
  preview,
  expandable = true,
  fullWidth = false,
  resizable = false,
  suspense = false,
  primary = false,
  // eslint-disable-next-line @typescript-eslint/require-await
}: ComponentPreviewProps) => {
  const demoItem = Index[name];
  if (!demoItem) {
    console.error(`Item not found: ${name}`);
    return null;
  }

  const Component = demoItem.component;
  const code: { fileName: string; code: string }[] = demoItem.files.map(
    (file: string) => {
      const { fileName, content } = getFileSource(file);
      return { fileName, code: content };
    },
  );

  return (
    <div
      className={cn("overflow-hidden rounded-md border", containerClassName)}
    >
      <div className="bg-bg-muted">
        <ResizableContainer resizable={resizable}>
          <ThemeProvider>
            <Button size="icon-sm" className="absolute top-2 right-2 z-10">
              <SlidersHorizontalIcon />
            </Button>
            <ScrollArea className="bg-bg text-fg">
              <div
                className={cn(
                  "flex py-10",
                  primary && "min-h-48 py-20",
                  fullWidth
                    ? "px-8 lg:px-12"
                    : "flex items-center justify-center px-4",
                )}
              >
                <div
                  className={cn(
                    fullWidth ? "w-full" : "flex items-center justify-center",
                  )}
                >
                  <ComponentWrapper suspense={suspense}>
                    <Component />
                  </ComponentWrapper>
                </div>
              </div>
            </ScrollArea>
          </ThemeProvider>
        </ResizableContainer>
      </div>
      <CodeBlock
        files={code.map((file) => ({
          fileName: file.fileName,
          code: file.code,
          lang: "tsx",
        }))}
        preview={preview}
        expandable={expandable}
      />
    </div>
  );
};
