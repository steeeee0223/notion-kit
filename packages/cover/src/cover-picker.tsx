"use client";

import React, { useState } from "react";

import { UrlForm } from "@notion-kit/common";
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
import { Unsplash } from "@notion-kit/unsplash";

export interface CoverPickerProps extends React.PropsWithChildren {
  /** @param unsplashAPIKey - Unsplash Access Key */
  unsplashAPIKey: string;
  onUpload?: (file: File) => void;
  onSelect?: (url: string) => void;
  onRemove?: () => void;
}

const CoverPicker: React.FC<CoverPickerProps> = ({
  children,
  unsplashAPIKey,
  onUpload,
  onSelect,
  onRemove,
}) => {
  /** Upload */
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
  };
  const handleUpload = (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);
      onUpload?.(file);
    }
    onClose();
  };
  /** Link & Unsplash */
  const onUrlSubmit = (url: string) => {
    setIsSubmitting(true);
    void onSelect?.(url);
    onClose();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-[520px]">
        <Tabs defaultValue="upload" className="relative my-0.5 w-full">
          <TabsList>
            <div className="grow">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="unsplash">Unsplash</TabsTrigger>
            </div>
            <div className="grow-0">
              <Button
                onClick={onRemove}
                size="sm"
                className="px-2 py-1"
                variant="hint"
              >
                Remove
              </Button>
            </div>
          </TabsList>
          <TabsContent value="upload" className="p-4 pb-2">
            <SingleImageDropzone
              className="w-full"
              disabled={isSubmitting}
              value={file}
              onChange={handleUpload}
            />
            <p className="p-4 text-center text-xs text-muted">
              Images wider than 1500 pixels work best.
            </p>
          </TabsContent>
          <TabsContent value="link" className="p-4 pb-2">
            <UrlForm disabled={isSubmitting} onUrlSubmit={onUrlSubmit} />
            <p className="p-4 text-center text-xs text-muted">
              Works with any image form the web.
            </p>
          </TabsContent>
          <TabsContent value="unsplash" className="mb-2">
            <Unsplash
              className="overflow-y-scroll"
              apiKey={unsplashAPIKey}
              onSelect={onUrlSubmit}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export { CoverPicker };
