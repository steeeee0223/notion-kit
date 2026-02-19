import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { IconMenu } from "./icon-menu";

// TanStack Virtual needs real element dimensions to render items.
// Mock getBoundingClientRect so the virtualizer thinks the container has height.
beforeAll(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 400,
    height: 400,
    top: 0,
    left: 0,
    bottom: 400,
    right: 400,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));
});

/**
 * Integration tests for the IconMenu UX flow.
 *
 * These test the full user journey:
 *   open menu → see tabs → type search → click icon → callback fires
 *
 * Note: We render IconMenuContent (via the default factories path) to avoid
 * needing to open a Radix Popover in jsdom; the content renders immediately.
 */
describe("IconMenu — UX flow", () => {
  it("renders trigger and opens popover on click", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    const trigger = screen.getByText("Open Icons");
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("tab", { name: "Emojis" })).toBeInTheDocument();
  });

  it("shows factory tabs and defaults to first tab", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));
    expect(screen.getByRole("tab", { name: "Emojis" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Icons" })).toBeInTheDocument();
    // Uploads tab is hidden when no icons are stored
    expect(
      screen.queryByRole("tab", { name: "Uploads" }),
    ).not.toBeInTheDocument();
  });

  it("switches tab when clicked", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));

    const iconsTab = screen.getByRole("tab", { name: "Icons" });
    expect(iconsTab).toBeInTheDocument();
    await user.click(iconsTab);
    expect(iconsTab.dataset.state).toBe("active");
  });

  it("shows search input and can type a query", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));

    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
    await user.type(input, "heart");
    expect(input).toHaveValue("heart");
  });

  it("calls onRemove when Remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <IconMenu onSelect={vi.fn()} onRemove={onRemove}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));

    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(removeButton).toBeInTheDocument();

    await user.click(removeButton);
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("shows Upload tab when onUpload is provided", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()} onUpload={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));
    expect(screen.getByRole("tab", { name: "Upload" })).toBeInTheDocument();
  });

  it("does not show Upload tab when onUpload is not provided", async () => {
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));
    expect(screen.getByRole("tab", { name: "Emojis" })).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Upload" }),
    ).not.toBeInTheDocument();
  });

  it("submitting a URL calls onSelect with correct data", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <IconMenu onSelect={onSelect} onUpload={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));

    // Switch to Upload tab
    const uploadTab = screen.getByRole("tab", { name: "Upload" });
    await user.click(uploadTab);

    // Type a URL and submit
    const urlInput = screen.getByPlaceholderText("Paste an image link...");
    await user.type(urlInput, "https://example.com/icon.png");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // onSelect should have been called with the URL
    expect(onSelect).toHaveBeenCalledWith({
      type: "url",
      src: "https://example.com/icon.png",
    });
  });

  it("submitted URL icon is stored in upload factory", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    render(
      <IconMenu onSelect={vi.fn()} onUpload={vi.fn()}>
        <span>Open Icons</span>
      </IconMenu>,
    );

    await user.click(screen.getByText("Open Icons"));

    // Go to Upload tab and submit a URL
    await user.click(screen.getByRole("tab", { name: "Upload" }));
    const urlInput = screen.getByPlaceholderText("Paste an image link...");
    await user.type(urlInput, "https://example.com/icon.png");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // The icon should be persisted in localStorage by the upload factory
    const stored = JSON.parse(
      localStorage.getItem("icon-menu:upload") ?? "[]",
    ) as unknown[];
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://example.com/icon.png" }),
      ]),
    );
  });
});
