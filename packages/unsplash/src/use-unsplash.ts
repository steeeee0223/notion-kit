"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createApi } from "unsplash-js";

import { defaultImages } from "./constants";

interface UnsplashImage {
  id: string;
  user: { name: string; portfolio_url: string };
  links: { html: string };
  urls: { thumb: string; full: string; regular: string; small: string };
  description?: string;
}

interface UnsplashConfig {
  apiKey: string;
}

export const useUnsplash = ({ apiKey }: UnsplashConfig) => {
  const unsplash = useMemo(
    () => createApi({ accessKey: apiKey, fetch }),
    [apiKey],
  );
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>();
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    const fetchImages = async (query: string, count = 24) => {
      try {
        if (query.length === 0) {
          const search = await unsplash.photos.getRandom({
            collectionIds: ["317099"],
            count,
          });
          if (!search.response) throw new Error("Failed to get random photos");
          return search.response as UnsplashImage[];
        }

        const search = await unsplash.search.getPhotos({
          query,
          perPage: count,
        });
        if (!search.response) throw new Error(`Failed to get photos: ${query}`);
        console.log(`search res: ${search.response.total}`);
        return search.response.results as UnsplashImage[];
      } catch (e) {
        console.log("[unsplash] Failed to get images from Unsplash!");
        console.log(e);
        return defaultImages as UnsplashImage[];
      }
    };

    startTransition(
      () => void fetchImages(query).then((images) => setImages(images)),
    );
  }, [unsplash, query]);

  return { isLoading, images, query, setQuery };
};
