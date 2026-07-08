import React, { useState } from "react";

import { cn } from "@notion-kit/cn";

import type { IconData } from "@/icon-block";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from "@/primitives";

import { UploadForm } from "./_components";
import { useDefaultFactories, type IconFactoryResult } from "./factories";
import { IconGridMenu } from "./icon-grid-menu";

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

  // Find the upload factory to persist submitted URLs / uploads
  const uploadFactory = factories.find((f) => f.id === "upload");

  const handleUploadSubmit = (url: string) => {
    uploadFactory?.select?.(url);
    onSelect?.({ type: "url", src: url });
  };

  const handleRandomSelect = () => {
    if (activeFactory?.getRandomIcon) {
      const item = activeFactory.getRandomIcon();
      const iconData = activeFactory.toIconData(item);
      onSelect?.(iconData);
      activeFactory.select?.(item.id);
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
          className="bg-transparent p-3"
        >
          <IconGridMenu
            factory={factory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelect={onSelect}
            onRandomSelect={handleRandomSelect}
          />
        </TabsContent>
      ))}
      {onUpload && (
        <TabsContent value="file" className="p-3">
          <UploadForm
            onSubmit={(res) => handleUploadSubmit(res.url)}
            onCancel={() => setActiveTab(visibleFactories[0]?.id ?? "")}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}

function IconMenuWithDefaults(props: Omit<IconMenuProps, "factories">) {
  const defaultFactories = useDefaultFactories();
  return <IconMenuContent factories={defaultFactories} {...props} />;
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
    <TooltipProvider>
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              variant={null}
              className={cn(
                "size-fit rounded-md border text-secondary disabled:opacity-100",
                className,
              )}
            >
              {children}
            </Button>
          }
        />
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
    </TooltipProvider>
  );
}
