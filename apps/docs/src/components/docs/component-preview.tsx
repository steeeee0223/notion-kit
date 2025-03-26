import React from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

import { ThemeProvider } from "@notion-kit/shadcn";

import { Index } from "@/__registry__/demos";
import { CodeBlock } from "@/components/docs/code-block";
import { getFileSource } from "@/lib/get-file-source";

import {
  ComponentWrapper,
  ResizableContainer,
} from "./component-preview-client";

interface ComponentPreviewProps {
  name: string;
  preview?: string;
  expandable?: boolean;
  /**
   * @deprecated currently not used
   */
  resizable?: boolean;
  /**
   * @deprecated currently not used
   */
  suspense?: boolean;
}

export const ComponentPreview = async ({
  name,
  preview,
  expandable = true,
  resizable = false,
  suspense = false,
  // eslint-disable-next-line @typescript-eslint/require-await
}: ComponentPreviewProps) => {
  const demoItem = Index[name];
  if (!demoItem) {
    console.error(`Item not found: ${name}`);
    return null;
  }

  const Component = demoItem.component;
  const files = demoItem.files.map((file) => getFileSource(file));

  return (
    <div className="overflow-hidden rounded-md border not-first:mt-4">
      <ResizableContainer resizable={resizable}>
        <ThemeProvider>
          <ScrollArea className="flex items-center justify-center px-4 py-10">
            <ComponentWrapper suspense={suspense}>
              <Component />
            </ComponentWrapper>
          </ScrollArea>
        </ThemeProvider>
      </ResizableContainer>
      <CodeBlock files={files} preview={preview} expandable={expandable} />
    </div>
  );
};
