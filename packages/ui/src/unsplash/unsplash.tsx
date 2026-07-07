import React from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
  AutocompleteStatus,
  Spinner,
  useAutocompleteFilteredItems,
} from "@/primitives";

import { useUnsplash, type UnsplashImage } from "./use-unsplash";

export interface UnsplashProps {
  /** @param apiKey - Unsplash Access Key */
  apiKey: string;
  className?: string;
  onSelect?: (url: string) => void;
}

function getImageLabel(image: UnsplashImage) {
  return image.description ?? `Unsplash image by ${image.user.name}`;
}

function getImageByValue(images: UnsplashImage[], value: string) {
  return images.find((image) => image.id === value);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function UnsplashImageGrid({ onSelect }: Pick<UnsplashProps, "onSelect">) {
  const filteredImages = useAutocompleteFilteredItems<UnsplashImage>();
  const rows = chunk(filteredImages, 4);

  return (
    <AutocompleteList className="flex w-full flex-col">
      {rows.map((row) => (
        <AutocompleteRow key={row.map((image) => image.id).join("-")}>
          {row.map((image, columnIndex) => {
            const index = filteredImages.indexOf(image);

            return (
              <AutocompleteItem
                key={image.id}
                value={image}
                index={index === -1 ? columnIndex : index}
                label={getImageLabel(image)}
                aria-label={getImageLabel(image)}
                onClick={() => onSelect?.(image.urls.regular)}
                render={
                  <div className="block aspect-video h-auto cursor-pointer rounded-sm p-[3px] select-none data-highlighted:bg-default/10" />
                }
              >
                <img
                  src={image.urls.small}
                  alt={image.description ?? "unsplash"}
                  className="h-16 w-full rounded-sm object-cover object-center"
                  referrerPolicy="same-origin"
                />
                <div className="mt-0.5 mb-1 w-full truncate text-xs text-muted">
                  by{" "}
                  <a
                    href={image.user.links.html}
                    className="text-muted underline hover:text-red"
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {image.user.name}
                  </a>
                </div>
              </AutocompleteItem>
            );
          })}
        </AutocompleteRow>
      ))}
    </AutocompleteList>
  );
}

/**
 * An `Unsplash` image browser
 */
export function Unsplash({ apiKey, onSelect }: UnsplashProps) {
  const { images, isLoading, query, status, onValueChange } = useUnsplash({
    apiKey,
  });
  const [highlightedImage, setHighlightedImage] =
    React.useState<UnsplashImage>();

  return (
    <Autocomplete<UnsplashImage>
      grid
      inline
      open
      autoHighlight="always"
      openOnInputClick
      items={images}
      value={query}
      filter={null}
      onValueChange={(value, details) => {
        if (details.reason === "item-press") {
          if (details.event instanceof KeyboardEvent) {
            const selectedImage = getImageByValue(images, value);
            if (selectedImage) {
              onSelect?.(selectedImage.urls.regular);
            }
          }
        } else {
          onValueChange(value);
        }
      }}
      onItemHighlighted={(image) => setHighlightedImage(image)}
      itemToStringValue={(image) => image.id}
    >
      <AutocompleteInput
        id="unsplash"
        search
        clear
        onCancel={() => onValueChange("")}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          const selectedImage = highlightedImage ?? images[0];
          if (!selectedImage) return;

          event.preventDefault();
          onSelect?.(selectedImage.urls.regular);
        }}
        placeholder="Search for an image..."
      />
      <AutocompleteContent variant="inline" aria-busy={isLoading || undefined}>
        <AutocompleteStatus className="flex items-center gap-2">
          {isLoading ? (
            <>
              <Spinner className="fill-icon" />
              Searching...
            </>
          ) : (
            status
          )}
        </AutocompleteStatus>
        <AutocompleteEmpty>No result found.</AutocompleteEmpty>
        <UnsplashImageGrid onSelect={onSelect} />
      </AutocompleteContent>
    </Autocomplete>
  );
}
