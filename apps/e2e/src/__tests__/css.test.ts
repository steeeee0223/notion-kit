/**
 * CSS Bundle E2E Tests
 *
 * Verifies that the pre-built CSS from @notion-kit/ui/style.css is
 * self-contained and usable by external consumers without needing
 * to scan source files or configure Tailwind themselves.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

function loadStyleCSS(): string {
  const cssPath = require.resolve("@notion-kit/ui/style.css");
  return readFileSync(cssPath, "utf-8");
}

describe("CSS Bundle Tests", () => {
  it("should resolve @notion-kit/ui/style.css", () => {
    const cssPath = require.resolve("@notion-kit/ui/style.css");
    expect(cssPath).toBeDefined();
    expect(cssPath).toContain("style.css");
  });

  it("should contain Tailwind CSS reset", () => {
    const css = loadStyleCSS();
    // Tailwind v4 always includes box-sizing reset
    expect(css).toContain("box-sizing:border-box");
  });

  describe("Theme tokens", () => {
    it("should contain :root light theme variables", () => {
      const css = loadStyleCSS();
      expect(css).toContain("--bg-main");
      expect(css).toContain("--bg-sidebar");
      expect(css).toContain("--bg-popover");
      expect(css).toContain("--primary");
      expect(css).toContain("--secondary");
      expect(css).toContain("--border");
      expect(css).toContain("--blue");
      expect(css).toContain("--ring");
      expect(css).toContain("--sha-out-md");
    });

    it("should contain .dark theme overrides", () => {
      const css = loadStyleCSS();
      // .dark selector should exist with overrides
      expect(css).toMatch(/\.dark\s*\{/);
    });
  });

  describe("Utility classes from @notion-kit/ui components", () => {
    it("should contain common layout utilities", () => {
      const css = loadStyleCSS();
      expect(css).toContain(".flex");
      expect(css).toContain(".hidden");
      expect(css).toContain(".relative");
      expect(css).toContain(".absolute");
    });

    it("should contain notion-kit color utilities", () => {
      const css = loadStyleCSS();
      // Custom theme colors used across components
      expect(css).toContain("bg-main");
      expect(css).toContain("bg-popover");
      expect(css).toContain("text-primary");
      expect(css).toContain("text-secondary");
      expect(css).toContain("border-border");
    });

    it("should contain custom utilities", () => {
      const css = loadStyleCSS();
      expect(css).toContain("overflow-x-initial");
    });
  });

  describe("Sub-package CSS coverage", () => {
    it("should contain utilities used by @notion-kit/settings-panel", () => {
      const css = loadStyleCSS();
      // Settings panel uses modal backgrounds, form elements
      expect(css).toContain("bg-modal");
      expect(css).toContain("bg-input");
    });

    it("should contain utilities used by @notion-kit/table-view", () => {
      const css = loadStyleCSS();
      // Table view uses border-cell and shadow tokens
      expect(css).toContain("border-cell");
      expect(css).toContain("shadow-notion");
      expect(css).toContain("l-pinned");
    });
  });
});
