import { act, renderHook, waitFor } from "@testing-library/react";
import { createApi } from "unsplash-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultImages } from "./constants";
import { useUnsplash, type UnsplashImage } from "./use-unsplash";

vi.mock("unsplash-js", () => ({
  createApi: vi.fn(),
}));

const mockCreateApi = vi.mocked(createApi);
const getMock = vi.fn();

function createImage(): UnsplashImage {
  return {
    id: "image-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    blur_hash: null,
    promoted_at: null,
    links: {
      html: "https://images.example.com/1",
      download: "https://images.example.com/1/download",
      self: "https://api.images.example.com/1",
      download_location: "https://api.images.example.com/1/download",
    },
    width: 1200,
    height: 800,
    description: "Forest trail",
    color: null,
    current_user_collections: [],
    user: {
      id: "user-1",
      updated_at: "2026-01-01T00:00:00Z",
      bio: null,
      first_name: "Ada",
      last_name: null,
      links: {
        html: "https://example.com/ada",
        photos: "https://example.com/ada/photos",
        self: "https://api.example.com/ada",
      },
      location: null,
      name: "Ada",
      profile_image: {
        small: "https://example.com/ada-small.jpg",
        medium: "https://example.com/ada-medium.jpg",
        large: "https://example.com/ada-large.jpg",
      },
      total_collections: 0,
      username: "ada",
      social: {
        instagram_username: null,
        portfolio_url: null,
        twitter_username: null,
      },
    },
    urls: {
      raw: "https://images.example.com/1-raw.jpg",
      thumb: "https://images.example.com/1-thumb.jpg",
      full: "https://images.example.com/1-full.jpg",
      regular: "https://images.example.com/1-regular.jpg",
      small: "https://images.example.com/1-small.jpg",
    },
  };
}

const images: UnsplashImage[] = [createImage()];

describe("useUnsplash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateApi.mockReturnValue({ GET: getMock } as never);
    getMock.mockResolvedValue({ data: images, error: undefined });
  });

  it("useUnsplash_InitialLoad_RequestsRandomImagesWithV8Endpoint", async () => {
    const { result } = renderHook(() => useUnsplash({ apiKey: "test-key" }));

    await waitFor(() => expect(result.current.images).toEqual(images));

    expect(mockCreateApi).toHaveBeenCalledWith({
      accessKey: "test-key",
      fetch,
    });
    expect(getMock).toHaveBeenCalledWith(
      "/photos/random",
      expect.objectContaining({
        params: {
          query: {
            collections: ["317099"],
            count: 24,
          },
        },
        signal: expect.any(AbortSignal) as unknown,
      }),
    );
  });

  it("useUnsplash_SearchValueChanged_RequestsSearchPhotosWithV8Endpoint", async () => {
    getMock.mockResolvedValueOnce({ data: [], error: undefined });
    getMock.mockResolvedValueOnce({
      data: { results: images },
      error: undefined,
    });
    const { result } = renderHook(() => useUnsplash({ apiKey: "test-key" }));

    act(() => result.current.onValueChange("forest"));

    await waitFor(() => expect(result.current.images).toEqual(images));

    expect(result.current.query).toBe("forest");
    expect(getMock).toHaveBeenLastCalledWith(
      "/search/photos",
      expect.objectContaining({
        params: {
          query: {
            query: "forest",
            per_page: 24,
          },
        },
        signal: expect.any(AbortSignal) as unknown,
      }),
    );
  });

  it("useUnsplash_SearchFailed_ReturnsFallbackImagesAndStatus", async () => {
    getMock.mockResolvedValueOnce({
      data: undefined,
      error: { errors: ["Rate limit exceeded"] },
    });

    const { result } = renderHook(() => useUnsplash({ apiKey: "test-key" }));

    await waitFor(() => expect(result.current.images).toEqual(defaultImages));

    expect(result.current.status).toBe("Rate limit exceeded");
  });
});
