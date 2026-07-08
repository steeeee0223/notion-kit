import { render, screen } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unsplash } from "./unsplash";
import { useUnsplash, type UnsplashImage } from "./use-unsplash";

vi.mock("./use-unsplash", () => ({
  useUnsplash: vi.fn(),
}));

const mockUseUnsplash = vi.mocked(useUnsplash);
const setQuery = vi.fn();

function createImage(
  id: string,
  description: string | null,
  userName: string,
): UnsplashImage {
  return {
    id,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    blur_hash: null,
    promoted_at: null,
    links: {
      html: `https://images.example.com/${id}`,
      download: `https://images.example.com/${id}/download`,
      self: `https://api.images.example.com/${id}`,
      download_location: `https://api.images.example.com/${id}/download`,
    },
    width: 1200,
    height: 800,
    description,
    color: null,
    current_user_collections: [],
    user: {
      id: `user-${id}`,
      updated_at: "2026-01-01T00:00:00Z",
      bio: null,
      first_name: userName,
      last_name: null,
      links: {
        html: `https://example.com/${userName.toLowerCase()}`,
        photos: `https://example.com/${userName.toLowerCase()}/photos`,
        self: `https://api.example.com/${userName.toLowerCase()}`,
      },
      location: null,
      name: userName,
      profile_image: {
        small: `https://example.com/${userName.toLowerCase()}-small.jpg`,
        medium: `https://example.com/${userName.toLowerCase()}-medium.jpg`,
        large: `https://example.com/${userName.toLowerCase()}-large.jpg`,
      },
      total_collections: 0,
      username: userName.toLowerCase(),
      social: {
        instagram_username: null,
        portfolio_url: null,
        twitter_username: null,
      },
    },
    urls: {
      raw: `https://images.example.com/${id}-raw.jpg`,
      thumb: `https://images.example.com/${id}-thumb.jpg`,
      full: `https://images.example.com/${id}-full.jpg`,
      regular: `https://images.example.com/${id}-regular.jpg`,
      small: `https://images.example.com/${id}-small.jpg`,
    },
  };
}

const images = [
  createImage("image-1", "Mountain lake", "Ada"),
  createImage("image-2", null, "Grace"),
];

describe("Unsplash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnsplash.mockReturnValue({
      images,
      isLoading: false,
      query: "mountain",
      status: null,
      onValueChange: setQuery,
    });
  });

  it("Unsplash_SearchTyped_UpdatesRemoteQuery", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    render(<Unsplash apiKey="test-key" />);

    await user.type(screen.getByRole("combobox"), "s");

    expect(setQuery).toHaveBeenCalledWith("mountains", expect.any(Object));
  });

  it("Unsplash_Loaded_RendersImageGridOptions", () => {
    render(<Unsplash apiKey="test-key" />);

    expect(
      screen.getByRole("gridcell", { name: "Mountain lake" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("gridcell", { name: "Unsplash image by Grace" }),
    ).toBeInTheDocument();
  });

  it("Unsplash_ImageClicked_CallsOnSelect", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const onSelect = vi.fn();
    render(<Unsplash apiKey="test-key" onSelect={onSelect} />);

    await user.click(screen.getByRole("gridcell", { name: "Mountain lake" }));

    expect(onSelect).toHaveBeenCalledWith(images[0]);
  });

  it("Unsplash_KeyboardSelection_CallsOnSelect", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const onSelect = vi.fn();
    render(<Unsplash apiKey="test-key" onSelect={onSelect} />);

    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(images[0]);
  });
});
