/**
 * Tests to verify that built packages can be rendered without errors.
 * This ensures components work correctly with the React Compiler.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Package Render Tests", () => {
  describe("@notion-kit/navbar", () => {
    it("should render Navbar", async () => {
      const { Navbar } = await import("@notion-kit/navbar");
      const { container } = render(<Navbar>Content</Navbar>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("@notion-kit/shadcn", () => {
    it("should render Input", async () => {
      const { Input } = await import("@notion-kit/shadcn");
      const { container } = render(<Input placeholder="Test input" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render Label", async () => {
      const { Label } = await import("@notion-kit/shadcn");
      const { container } = render(<Label>Test Label</Label>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render Separator", async () => {
      const { Separator } = await import("@notion-kit/shadcn");
      const { container } = render(<Separator />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
