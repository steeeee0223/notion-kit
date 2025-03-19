"use client";

import type { ScrollAreaProps } from "@/components/core/scroll-area";
import React, { useState } from "react";
import { ScrollArea } from "@/components/core/scroll-area";
import { CheckIcon, CopyIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import type { ButtonProps } from "@notion-kit/shadcn";
import { cn } from "@notion-kit/cn";
import {
  Button,
  TabsTrigger as Tab,
  Tabs,
  TabsContent,
  TabsList,
} from "@notion-kit/shadcn";

const codeBlockStyles = tv({
  slots: {
    header:
      "bg-bg-muted flex h-10 items-center justify-between rounded-t-[inherit]",
    body: "bg-bg-muted/30 p-4 text-xs",
    code: "text-xs",
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

const CodeBlockClient = ({
  files,
  preview,
  previewStr,
  expandable = false,
}: CodeBlockClientProps) => {
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
      <CodeBlockHeader>
        {files.length > 0 && (
          <TabsList>
            <div className="flex grow">
              {files
                .slice(0, preview && !isExpanded ? 1 : files.length)
                .map(({ fileName }, index) => (
                  <Tab key={index} value={fileName}>
                    {fileName}
                  </Tab>
                ))}
            </div>
            <div className="flex grow-0 items-center gap-2">
              {(preview ?? expandable) && (
                <Button
                  variant="hint"
                  size="sm"
                  className="h-7"
                  onClick={handleExpand}
                >
                  {isExpanded ? "Collapse" : "Expand"} code
                </Button>
              )}
              <CodeBlockCopyButton
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
      </CodeBlockHeader>
      <CodeBlockBody
        className={cn(isExpanded ? "max-h-[400px]" : "max-h-[200px]")}
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
      </CodeBlockBody>
    </Tabs>
  );
};

type CodeBlockHeaderProps = React.HTMLAttributes<HTMLDivElement>;
const CodeBlockHeader = ({ className, ...props }: CodeBlockHeaderProps) => {
  const { header } = codeBlockStyles();
  return <div className={header({ className })} {...props} />;
};

type CodeBlockBodyProps = ScrollAreaProps;
const CodeBlockBody = ({ className, ...props }: CodeBlockBodyProps) => {
  const { body } = codeBlockStyles();
  return (
    <ScrollArea scrollbars="both" className={body({ className })} {...props} />
  );
};

interface CodeBlockCopyButtonProps extends ButtonProps {
  code: string;
}
const CodeBlockCopyButton = ({ code, ...props }: CodeBlockCopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Button
      size="icon-sm"
      onClick={handleCopy}
      className="size-7 [&_svg]:size-4"
      {...props}
    >
      {copied ? (
        <CheckIcon className="animate-in fade-in" />
      ) : (
        <CopyIcon className="animate-in fade-in" />
      )}
    </Button>
  );
};

export { CodeBlockClient };
