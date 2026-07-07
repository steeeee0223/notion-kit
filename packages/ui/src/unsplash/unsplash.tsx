import React from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
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

function getImageSearchValue(image: UnsplashImage, query: string) {
  return [query, image.description, image.user.name].filter(Boolean).join(" ");
}

function getImageBySearchValue(
  images: UnsplashImage[],
  value: string,
  query: string,
) {
  return images.find((image) => getImageSearchValue(image, query) === value);
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
  const rows = chunk(filteredImages, 3);

  return (
    <AutocompleteList className="flex w-full flex-col">
      {rows.map((row) => (
        <AutocompleteRow
          key={row.map((image) => image.id).join("-")}
          className="grid w-full grid-cols-3"
        >
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
                  <div className="group block aspect-video h-auto cursor-pointer p-[3px] select-none" />
                }
              >
                <img
                  src={image.urls.small}
                  alt={image.description ?? "unsplash"}
                  className="h-16 w-full rounded-sm object-cover object-center group-data-highlighted:opacity-75"
                  referrerPolicy="same-origin"
                />
                <div className="mt-0.5 mb-1 w-full truncate text-xs text-muted">
                  by{" "}
                  <a
                    href={image.user.portfolio_url}
                    className="text-muted underline group-data-highlighted:text-red"
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
  const { images = [], isLoading, query, setQuery } = useUnsplash({ apiKey });
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
      onValueChange={(value, details) => {
        if (details.reason === "item-press") {
          if (details.event instanceof KeyboardEvent) {
            const selectedImage = getImageBySearchValue(images, value, query);
            if (selectedImage) {
              onSelect?.(selectedImage.urls.regular);
            }
          }
        } else {
          setQuery(value);
        }
      }}
      onItemHighlighted={(image) => setHighlightedImage(image)}
      itemToStringValue={(image) => getImageSearchValue(image, query)}
    >
      <AutocompleteInput
        id="unsplash"
        search
        clear
        onCancel={() => setQuery("")}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          const selectedImage = highlightedImage ?? images?.[0];
          if (!selectedImage) return;

          event.preventDefault();
          onSelect?.(selectedImage.urls.regular);
        }}
        placeholder="Search for an image..."
      />
      <AutocompleteContent variant="inline">
        {isLoading && <Spinner className="fill-icon" />}
        <AutocompleteEmpty>No result found.</AutocompleteEmpty>
        <UnsplashImageGrid onSelect={onSelect} />
      </AutocompleteContent>
    </Autocomplete>
  );
}
