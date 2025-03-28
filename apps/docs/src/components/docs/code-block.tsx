"use client";

import React, { useState } from "react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { tv } from "tailwind-variants";

import { cn } from "@notion-kit/cn";
import {
  Button,
  TabsTrigger as Tab,
  Tabs,
  TabsContent,
  TabsList,
} from "@notion-kit/shadcn";

import { ScrollArea } from "./scroll-area";

const codeblockStyles = tv({
  slots: {
    content: "text-xs [&_figure]:rounded-none [&_figure]:border-none",
  },
});

interface CodeBlockProps {
  files: {
    fileName: string;
    code: string;
    lang: string;
  }[];
  preview?: string;
  expandable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  files,
  preview,
  expandable,
}) => {
  const { content } = codeblockStyles();

  const [activeTab, setActiveTab] = useState(files[0]?.fileName ?? "");
  const [isExpanded, setExpanded] = useState(false);
  const handleExpand = () => {
    const prevState = isExpanded;
    if (prevState) {
      setActiveTab(files[0]?.fileName ?? "");
    }
    setExpanded(!prevState);
  };

  return (
    <Tabs
      className="relative w-full border-t"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <div className="flex h-10 items-center justify-between rounded-t-[inherit]">
        {files.length > 0 && (
          <TabsList>
            <div className="flex grow">
              {files
                .slice(0, preview && !isExpanded ? 1 : files.length)
                .map(({ fileName }) => (
                  <Tab key={fileName} value={fileName} className="font-normal">
                    {fileName}
                  </Tab>
                ))}
            </div>
            <div className="flex grow-0">
              {(preview ?? expandable) && (
                <Button
                  variant="hint"
                  size="sm"
                  className="h-7 font-normal"
                  onClick={handleExpand}
                >
                  {isExpanded ? "Collapse" : "Expand"} code
                </Button>
              )}
            </div>
          </TabsList>
        )}
      </div>
      <ScrollArea
        scrollbars="both"
        className={cn(isExpanded ? "max-h-[400px]" : "max-h-[200px]")}
      >
        {preview && !isExpanded ? (
          <TabsContent value={files[0]?.fileName ?? ""} className={content()}>
            <DynamicCodeBlock lang="tsx" code={preview} />
          </TabsContent>
        ) : (
          files.map(({ fileName, code, lang }) => (
            <TabsContent key={fileName} value={fileName} className={content()}>
              <DynamicCodeBlock lang={lang} code={code} />
            </TabsContent>
          ))
        )}
      </ScrollArea>
    </Tabs>
  );
};

export { CodeBlock };
