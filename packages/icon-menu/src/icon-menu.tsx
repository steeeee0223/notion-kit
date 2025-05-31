"use client";

import React, { useState, useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { UrlForm } from "@notion-kit/common";
import type { IconData, LucideName } from "@notion-kit/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/shadcn";
import { SingleImageDropzone } from "@notion-kit/single-image-dropzone";

import { EmojiPicker } from "./emoji-picker";
import { LucidePicker } from "./lucide-picker";

export interface IconMemuProps extends React.PropsWithChildren {
  className?: string;
  disabled?: boolean;
  onSelect?: (iconData: IconData) => void;
  onRemove?: () => void;
  onUpload?: (file: File) => void;
}

/**
 * A controlled popover menu for icon selection and upload.
 */
export const IconMenu: React.FC<IconMemuProps> = ({
  className,
  disabled,
  children,
  onSelect,
  onRemove,
  onUpload,
}) => {
  const selectEmoji = (src: string) => onSelect?.({ type: "emoji", src });
  const selectLucideIcon = (src: LucideName, color?: string) =>
    onSelect?.({ type: "lucide", src, color });
  const submitUrl = (src: string) => onSelect?.({ type: "url", src });
  /** Upload */
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File>();
  const handleUpload = (file?: File) => {
    if (file) {
      startTransition(() => {
        setFile(file);
        onUpload?.(file);
      });
    }
    setFile(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={null}
          className={cn(
            "size-fit rounded-md border p-0 text-secondary disabled:opacity-100",
            className,
          )}
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-999 h-[356px] w-[408px]">
        <Tabs defaultValue="emoji" className="relative my-0.5 w-full">
          <TabsList>
            <div className="flex grow">
              <TabsTrigger value="emoji">Emojis</TabsTrigger>
              <TabsTrigger value="lucide">Icons</TabsTrigger>
              <TabsTrigger value="file">Upload</TabsTrigger>
            </div>
            <div className="flex grow-0">
              <Button
                onClick={onRemove}
                variant="hint"
                size="sm"
                className="my-1 p-1"
              >
                Remove
              </Button>
            </div>
          </TabsList>
          <TabsContent value="emoji" className="bg-transparent px-3 pt-4 pb-2">
            <EmojiPicker onSelect={selectEmoji} />
          </TabsContent>
          <TabsContent value="lucide" className="bg-transparent px-3 pt-4 pb-2">
            <LucidePicker onSelect={selectLucideIcon} />
          </TabsContent>
          <TabsContent value="file" className="px-5 pt-4 pb-2">
            <UrlForm disabled={isPending} onUrlSubmit={submitUrl} />
            <SingleImageDropzone
              className="mt-6 w-full"
              disabled={isPending}
              value={file}
              onChange={handleUpload}
            />
            <p className="p-4 text-center text-xs text-muted">
              Recommended size is 280 × 280 pixels
            </p>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
