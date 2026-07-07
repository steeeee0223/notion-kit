import { useMemo } from "react";

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
  AutocompleteStatus,
  Spinner,
} from "@/primitives";

import { useUnsplash, type UnsplashImage } from "./use-unsplash";

export interface UnsplashProps {
  /** @param apiKey - Unsplash Access Key */
  apiKey: string;
  onSelect?: (image: UnsplashImage) => void;
}

function getImageLabel(image: UnsplashImage) {
  return image.description ?? `Unsplash image by ${image.user.name}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface UnsplashGroup {
  items: UnsplashImage[];
}

function UnsplashImageGrid({ onSelect }: Pick<UnsplashProps, "onSelect">) {
  return (
    <AutocompleteList>
      {(group: UnsplashGroup) => (
        <AutocompleteGroup>
          {chunk(group.items, 4).map((row) => (
            <AutocompleteRow
              key={row.map((image) => image.id).join("-")}
              className="grid w-full grid-cols-4"
            >
              {row.map((image) => (
                <AutocompleteItem
                  key={image.id}
                  value={image}
                  label={getImageLabel(image)}
                  aria-label={getImageLabel(image)}
                  onClick={() => onSelect?.(image)}
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
              ))}
            </AutocompleteRow>
          ))}
        </AutocompleteGroup>
      )}
    </AutocompleteList>
  );
}

/**
 * An `Unsplash` image browser
 */
export function Unsplash({ apiKey, onSelect }: UnsplashProps) {
  const {
    images = [],
    isLoading,
    query,
    status,
    onValueChange,
  } = useUnsplash({
    apiKey,
  });

  const groups = useMemo(() => [{ items: images }], [images]);

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
      onValueChange={onValueChange}
      itemToStringValue={(image) => image.id}
    >
      <AutocompleteInput
        id="unsplash"
        search
        clear
        onCancel={() => onValueChange("")}
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
