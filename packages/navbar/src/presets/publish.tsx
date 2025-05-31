"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Globe } from "lucide-react";

import { useCopyToClipboard, useOrigin } from "@notion-kit/hooks";
import type { Page } from "@notion-kit/schemas";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@notion-kit/shadcn";

import { NavbarItem } from "../core";

interface PublishProps {
  page: Page;
  onUpdate?: (id: string, isPublished: boolean) => void;
}

export const Publish: React.FC<PublishProps> = ({ page, onUpdate }) => {
  const [isPublished, setIsPublished] = useState(page.isPublished);

  /** Url */
  const origin = useOrigin();
  const url = `${origin}${page.publicUrl ?? ""}`;
  /** Copy */
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const onCopy = async () => {
    await copy(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };
  /** Actions - Publish & Unpublish */
  const [isPending, startTransition] = useTransition();
  const handlePublish = () => {
    startTransition(() => {
      onUpdate?.(page.id, !isPublished);
      setIsPublished((prev) => !prev);
    });
    if (isPublished) toast.success(`Unpublished Document: "${page.title}"`);
    else toast.success(`Published Document: "${page.title}"`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <NavbarItem
          hint="Share or publish to the web"
          className="ml-1 h-7 w-[initial] px-2"
        >
          Share
          {isPublished && <Globe className="ml-2 size-4 text-blue" />}
        </NavbarItem>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px]"
        align="end"
        alignOffset={8}
        forceMount
      >
        <Tabs defaultValue="publish" className="relative my-0.5 w-full">
          <TabsList>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>
          <TabsContent value="publish" className="p-5 pt-3">
            {isPublished ? (
              <div className="space-y-4">
                <div className="flex items-center gap-x-2 text-sm text-blue">
                  <Globe className="size-4 animate-pulse" />
                  <p className="font-medium">This note is live on web.</p>
                </div>
                <div className="flex items-center">
                  <Input
                    variant="plain"
                    className="flex-1 truncate rounded-r-none border-r-0"
                    value={url}
                    disabled
                  />
                  <Button
                    variant="icon"
                    onClick={onCopy}
                    disabled={isCopied}
                    className="size-7 rounded-l-none"
                  >
                    {isCopied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="red"
                  className="w-full"
                  disabled={isPending}
                  onClick={handlePublish}
                >
                  Unpublish
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Globe className="size-8 text-icon" />
                <p className="text-sm font-medium">Publish to web</p>
                <span className="text-xs text-muted">
                  Create a website with Notion
                </span>
                <Button
                  variant="blue"
                  disabled={isPending || page.isArchived}
                  onClick={handlePublish}
                  className="mt-2 w-full"
                  size="sm"
                >
                  Publish
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
