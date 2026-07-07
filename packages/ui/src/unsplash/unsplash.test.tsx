import { render, screen } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unsplash } from "./unsplash";
import { useUnsplash } from "./use-unsplash";

vi.mock("./use-unsplash", () => ({
  useUnsplash: vi.fn(),
}));

const mockUseUnsplash = vi.mocked(useUnsplash);
const setQuery = vi.fn();

const images = [
  {
    id: "image-1",
    user: { name: "Ada", portfolio_url: "https://example.com/ada" },
    links: { html: "https://images.example.com/1" },
    urls: {
      thumb: "https://images.example.com/1-thumb.jpg",
      full: "https://images.example.com/1-full.jpg",
      regular: "https://images.example.com/1-regular.jpg",
      small: "https://images.example.com/1-small.jpg",
    },
    description: "Mountain lake",
  },
  {
    id: "image-2",
    user: { name: "Grace", portfolio_url: "https://example.com/grace" },
    links: { html: "https://images.example.com/2" },
    urls: {
      thumb: "https://images.example.com/2-thumb.jpg",
      full: "https://images.example.com/2-full.jpg",
      regular: "https://images.example.com/2-regular.jpg",
      small: "https://images.example.com/2-small.jpg",
    },
    description: undefined,
  },
];

describe("Unsplash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUnsplash.mockReturnValue({
      images,
      isLoading: false,
      query: "mountain",
      setQuery,
    });
  });

  it("Unsplash_SearchTyped_UpdatesRemoteQuery", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    render(<Unsplash apiKey="test-key" />);

    await user.type(screen.getByRole("combobox"), "s");

    expect(setQuery).toHaveBeenCalledWith("mountains");
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

    expect(onSelect).toHaveBeenCalledWith(
      "https://images.example.com/1-regular.jpg",
    );
  });

  it("Unsplash_KeyboardSelection_CallsOnSelect", async () => {
    const user = userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    const onSelect = vi.fn();
    render(<Unsplash apiKey="test-key" onSelect={onSelect} />);

    screen.getByRole("combobox").focus();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(
      "https://images.example.com/1-regular.jpg",
    );
  });
});
