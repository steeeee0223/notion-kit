"use client";

import React from "react";
import { ImageIcon, X } from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Button, Skeleton } from "@notion-kit/shadcn";

import type { CoverPickerProps } from "./cover-picker";
import { CoverPicker } from "./cover-picker";

export interface CoverProps extends CoverPickerProps {
  url?: string;
  alt?: string;
  preview?: boolean;
}

const Cover = ({ url, alt, preview, ...props }: CoverProps) => {
  return (
    <div
      className={cn(
        "group relative h-[30vh] max-h-[280px] w-full",
        url ? "bg-main" : "h-[12vh]",
      )}
    >
      {!!url && (
        <img
          src={url}
          alt={alt}
          className="block size-full object-cover object-center"
        />
      )}
      {url && !preview && (
        <div className="absolute right-5 bottom-5 flex items-center gap-x-2 opacity-0 group-hover:opacity-100">
          <div className="rounded-sm bg-popover">
            <CoverPicker {...props}>
              <Button size="sm">
                <ImageIcon className="mr-2 size-4" />
                Change cover
              </Button>
            </CoverPicker>
          </div>
          <div className="rounded-sm bg-popover">
            <Button onClick={props.onRemove} size="sm">
              <X className="mr-2 size-4" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="h-[35vh] w-full" />;
};

export { Cover };
