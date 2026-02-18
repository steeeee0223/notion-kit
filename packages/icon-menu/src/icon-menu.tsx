"use client";

import React, { useState, useTransition } from "react";

import { cn } from "@notion-kit/cn";
import { UrlForm } from "@notion-kit/common/url-form";
import type { IconData } from "@notion-kit/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@notion-kit/shadcn";
import { SingleImageDropzone } from "@notion-kit/single-image-dropzone";

import {
  MenuSearchBar,
  useDefaultFactories,
  VirtualizedIconGrid,
} from "./_components";
import type { IconFactoryResult } from "./factories";

export interface IconMenuProps extends React.PropsWithChildren {
  className?: string;
  disabled?: boolean;
  factories?: IconFactoryResult[];
  onSelect?: (iconData: IconData) => void;
  onRemove?: () => void;
  onUpload?: (file: File) => void;
}

function IconMenuContent({
  factories,
  onSelect,
  onRemove,
  onUpload,
}: {
  factories: IconFactoryResult[];
  onSelect?: (iconData: IconData) => void;
  onRemove?: () => void;
  onUpload?: (file: File) => void;
}) {
  // Filter out factories that are hidden (e.g. upload factory with no stored icons)
  const visibleFactories = factories.filter((f) => !f.hidden);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(visibleFactories[0]?.id ?? "");

  const activeFactory = factories.find((f) => f.id === activeTab);

  // Find the upload factory to persist submitted URLs
  const uploadFactory = factories.find((f) => f.id === "upload");

  const submitUrl = (src: string) => {
    uploadFactory?.onSelect?.({ id: src, name: src, keywords: [] });
    onSelect?.({ type: "url", src });
  };

  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File>();
  const handleUpload = (uploadedFile?: File) => {
    if (uploadedFile) {
      startTransition(() => {
        setFile(uploadedFile);
        onUpload?.(uploadedFile);
      });
    }
    setFile(undefined);
  };

  const handleRandomSelect = () => {
    if (activeFactory?.getRandomIcon) {
      const item = activeFactory.getRandomIcon();
      const iconData = activeFactory.toIconData(item, {});
      onSelect?.(iconData);
      activeFactory.onSelect?.(item);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        setSearchQuery("");
      }}
      className="relative my-0.5 w-full"
    >
      <TabsList>
        <div className="flex grow">
          {visibleFactories.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
            </TabsTrigger>
          ))}
          {onUpload && <TabsTrigger value="file">Upload</TabsTrigger>}
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
      {visibleFactories.map((factory) => (
        <TabsContent
          key={factory.id}
          value={factory.id}
          className="bg-transparent px-3 pt-4 pb-2"
        >
          <MenuSearchBar
            search={searchQuery}
            onSearchChange={setSearchQuery}
            onRandomSelect={handleRandomSelect}
            Palette={factory.toolbar}
          />
          {factory.isLoading ? (
            <Spinner className="mx-1 my-2 fill-icon" />
          ) : (
            <VirtualizedIconGrid
              factory={factory}
              searchQuery={searchQuery}
              onSelect={(data) => onSelect?.(data)}
            />
          )}
        </TabsContent>
      ))}
      {onUpload && (
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
      )}
    </Tabs>
  );
}

function IconMenuWithDefaults(
  props: Omit<IconMenuProps, "factories"> & { factories?: undefined },
) {
  const defaultFactories = useDefaultFactories();
  return (
    <IconMenuContent
      factories={defaultFactories}
      onSelect={props.onSelect}
      onRemove={props.onRemove}
      onUpload={props.onUpload}
    />
  );
}

export function IconMenu({
  className,
  disabled,
  children,
  factories,
  onSelect,
  onRemove,
  onUpload,
}: IconMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={null}
          className={cn(
            "size-fit rounded-md border text-secondary disabled:opacity-100",
            className,
          )}
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-999 w-102">
        {factories ? (
          <IconMenuContent
            factories={factories}
            onSelect={onSelect}
            onRemove={onRemove}
            onUpload={onUpload}
          />
        ) : (
          <IconMenuWithDefaults
            onSelect={onSelect}
            onRemove={onRemove}
            onUpload={onUpload}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
