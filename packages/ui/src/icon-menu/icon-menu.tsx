import React, { useMemo, useState } from "react";

import { cn } from "@notion-kit/cn";

import type { IconData } from "@/icon-block";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteList,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from "@/primitives";

import { MenuSearchBar, UploadForm, VirtualizedIconGrid } from "./_components";
import type { IconAutocompleteItem } from "./_components";
import { useDefaultFactories, type IconFactoryResult } from "./factories";

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

  const handleUploadSubmit = ({ name, url }: { name: string; url: string }) => {
    uploadFactory?.onSelect?.({ id: url, name, keywords: [name] });
    onSelect?.({ type: "url", src: url });
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
          className="bg-transparent p-3"
        >
          <IconFactoryPanel
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
            onSubmit={handleUploadSubmit}
            onCancel={() => setActiveTab(visibleFactories[0]?.id ?? "")}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}

function IconFactoryPanel({
  factory,
  searchQuery,
  setSearchQuery,
  onSelect,
  onRandomSelect,
}: {
  factory: IconFactoryResult;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  onSelect?: (iconData: IconData) => void;
  onRandomSelect: () => void;
}) {
  const autocompleteItems = useMemo<IconAutocompleteItem[]>(
    () =>
      factory.sections.flatMap((section) =>
        section.iconIds.map((id) => ({
          id,
          sectionId: section.id,
          sectionLabel: section.label,
          item: factory.getItem(id),
        })),
      ),
    [factory],
  );

  return (
    <Autocomplete<IconAutocompleteItem>
      grid
      virtualized
      inline
      open
      autoHighlight="always"
      openOnInputClick
      items={autocompleteItems}
      itemToStringValue={({ item }) =>
        [item.name, ...item.keywords].filter(Boolean).join(" ")
      }
      value={searchQuery}
      onValueChange={(value, details) => {
        if (details.reason !== "item-press") {
          setSearchQuery(value);
        }
      }}
    >
      <MenuSearchBar
        onRandomSelect={onRandomSelect}
        onSearchClear={() => setSearchQuery("")}
        Palette={factory.toolbar}
      />
      {factory.isLoading ? (
        <Spinner className="mx-1 my-2 fill-icon" />
      ) : (
        <AutocompleteContent variant="inline">
          <AutocompleteEmpty className="h-[214px] justify-center">
            No results
          </AutocompleteEmpty>
          <AutocompleteList>
            <VirtualizedIconGrid factory={factory} onSelect={onSelect} />
          </AutocompleteList>
        </AutocompleteContent>
      )}
    </Autocomplete>
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
