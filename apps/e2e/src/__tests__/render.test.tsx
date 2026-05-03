/**
 * Tests to verify that built packages can be rendered without errors.
 * This ensures components work correctly with the React Compiler.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Package Render Tests", () => {
  describe("@notion-kit/ui/navbar", () => {
    it("should render Navbar", async () => {
      const { Navbar } = await import("@notion-kit/ui/navbar");
      const { container } = render(<Navbar>Content</Navbar>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("@notion-kit/ui/primitives", () => {
    it("should render Input", async () => {
      const { Input } = await import("@notion-kit/ui/primitives");
      const { container } = render(<Input placeholder="Test input" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render Calendar", async () => {
      const { Calendar } = await import("@notion-kit/ui/primitives");
      const { container } = render(<Calendar />);
      expect(container).toBeInTheDocument();
    });

    it("should render Separator", async () => {
      const { Separator } = await import("@notion-kit/ui/primitives");
      const { container } = render(<Separator />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
