import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createApi, type AssetBasic, type ErrorResponse } from "unsplash-js";

import { defaultImages } from "./constants";

export type UnsplashImage = AssetBasic;

interface UnsplashConfig {
  apiKey: string;
}

const DEFAULT_COLLECTION_ID = "317099";
const DEFAULT_IMAGE_COUNT = 24;

function normalizeImages(images: UnsplashImage | UnsplashImage[]) {
  return Array.isArray(images) ? images : [images];
}

function getErrorMessage(error?: ErrorResponse) {
  return error?.errors[0] ?? "Failed to get images from Unsplash.";
}

export function useUnsplash({ apiKey }: UnsplashConfig) {
  const unsplash = useMemo(
    () => createApi({ accessKey: apiKey, fetch }),
    [apiKey],
  );
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchImages = useCallback(
    async (nextQuery: string, signal: AbortSignal) => {
      try {
        if (nextQuery.length === 0) {
          const result = await unsplash.GET("/photos/random", {
            params: {
              query: {
                collections: [DEFAULT_COLLECTION_ID],
                count: DEFAULT_IMAGE_COUNT,
              },
            },
            signal,
          });
          if (result.error) {
            return {
              images: defaultImages as UnsplashImage[],
              status: getErrorMessage(result.error),
            };
          }

          return {
            images: normalizeImages(result.data),
            status: null,
          };
        }

        const result = await unsplash.GET("/search/photos", {
          params: {
            query: {
              query: nextQuery,
              per_page: DEFAULT_IMAGE_COUNT,
            },
          },
          signal,
        });

        if (result.error) {
          return {
            images: defaultImages as UnsplashImage[],
            status: getErrorMessage(result.error),
          };
        }

        return {
          images: result.data.results,
          status:
            nextQuery.length > 0 && result.data.results.length > 0
              ? `${result.data.results.length} image${
                  result.data.results.length === 1 ? "" : "s"
                } found`
              : null,
        };
      } catch (error) {
        if (signal.aborted) {
          return null;
        }

        return {
          images: defaultImages as UnsplashImage[],
          status:
            error instanceof Error
              ? error.message
              : "Failed to get images from Unsplash.",
        };
      }
    },
    [unsplash],
  );

  const onValueChange = useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      startTransition(async () => {
        setStatus(null);
        const result = await fetchImages(nextQuery, controller.signal);
        if (!result || controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setImages(result.images);
          setStatus(result.status);
        });
      });
    },
    [fetchImages],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onValueChange("");

    return () => abortControllerRef.current?.abort();
  }, [onValueChange]);

  return { isLoading, images, query, status, onValueChange };
}
