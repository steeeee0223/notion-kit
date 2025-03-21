"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/core/scroll-area";
import { CheckIcon, CopyIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import {
  Button,
  TabsTrigger as Tab,
  Tabs,
  TabsContent,
  TabsList,
} from "@notion-kit/shadcn";

const codeBlockStyles = tv({
  slots: {
    header: "flex h-10 items-center justify-between rounded-t-[inherit]",
    body: "p-4 text-xs",
  },
});

interface CodeBlockClientProps {
  files: {
    fileName: string;
    code: React.ReactNode;
    codeStr: string;
    lang: string;
  }[];
  preview?: React.ReactNode;
  previewStr?: string;
  expandable?: boolean;
}

const CodeBlockClient: React.FC<CodeBlockClientProps> = ({
  files,
  preview,
  previewStr,
  expandable = false,
}) => {
  const { header, body } = codeBlockStyles();

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
      className="relative my-0.5 w-full border-t"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <div className={header()}>
        {files.length > 0 && (
          <TabsList>
            <div className="flex grow">
              {files
                .slice(0, preview && !isExpanded ? 1 : files.length)
                .map(({ fileName }, index) => (
                  <Tab key={index} value={fileName} className="font-normal">
                    {fileName}
                  </Tab>
                ))}
            </div>
            <div className="flex grow-0 items-center gap-2">
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
              <CopyButton
                code={
                  (previewStr && !isExpanded
                    ? previewStr
                    : files.find(({ fileName }) => fileName === activeTab)
                        ?.codeStr)!
                }
              />
            </div>
          </TabsList>
        )}
      </div>
      <ScrollArea
        scrollbars="both"
        className={body({
          className: isExpanded ? "max-h-[400px]" : "max-h-[200px]",
        })}
      >
        {preview && !isExpanded ? (
          <TabsContent value={files[0]?.fileName ?? ""}>{preview}</TabsContent>
        ) : (
          files.map(({ fileName, code }, index) => (
            <TabsContent key={index} value={fileName}>
              {code}
            </TabsContent>
          ))
        )}
      </ScrollArea>
    </Tabs>
  );
};

interface CopyButtonProps {
  code: string;
}
const CopyButton: React.FC<CopyButtonProps> = ({ code }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Button
      size="icon-md"
      onClick={handleCopy}
      className="[&_svg]:animate-in [&_svg]:fade-in [&_svg]:size-4"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

export { CodeBlockClient };
