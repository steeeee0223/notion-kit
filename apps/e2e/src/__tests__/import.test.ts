/**
 * Tests to verify that built packages can be imported and rendered without errors.
 * This ensures that the React Compiler runtime is correctly configured.
 */
import { describe, expect, it } from "vitest";

describe("Package Import Tests", () => {
  it.skip("should import @notion-kit/auth-ui without errors", async () => {
    const { LoginForm } = await import("@notion-kit/auth-ui");
    expect(LoginForm).toBeDefined();
  });

  it("should import @notion-kit/cn without errors", async () => {
    const { cn } = await import("@notion-kit/cn");
    expect(cn).toBeDefined();
  });

  it.skip("should import @notion-kit/cover without errors", async () => {
    const { Cover } = await import("@notion-kit/cover");
    expect(Cover).toBeDefined();
  });

  it("should import @notion-kit/hooks without errors", async () => {
    const hooks = await import("@notion-kit/hooks");
    expect(hooks).toBeDefined();
  });

  it("should import @notion-kit/i18n without errors", async () => {
    const i18n = await import("@notion-kit/i18n");
    expect(i18n).toBeDefined();
  });

  it("should import @notion-kit/icon-block without errors", async () => {
    const { IconBlock } = await import("@notion-kit/icon-block");
    expect(IconBlock).toBeDefined();
  }, 10000); // Longer timeout for large package

  it("should import @notion-kit/icon-menu without errors", async () => {
    const { IconMenu } = await import("@notion-kit/icon-menu");
    expect(IconMenu).toBeDefined();
  });

  it("should import @notion-kit/icons without errors", async () => {
    const { Icon } = await import("@notion-kit/icons");
    expect(Icon).toBeDefined();
  });

  it("should import @notion-kit/navbar without errors", async () => {
    const { Navbar } = await import("@notion-kit/navbar");
    expect(Navbar).toBeDefined();
  });

  it("should import @notion-kit/selectable without errors", async () => {
    const { Selectable, useSelectable, useSelectableItem } = await import(
      "@notion-kit/selectable"
    );
    expect(Selectable).toBeDefined();
    expect(useSelectable).toBeDefined();
    expect(useSelectableItem).toBeDefined();
  });

  it("should import @notion-kit/settings-panel without errors", async () => {
    const { SettingsPanel } = await import("@notion-kit/settings-panel");
    expect(SettingsPanel).toBeDefined();
  });

  it("should import @notion-kit/shadcn without errors", async () => {
    const { Button } = await import("@notion-kit/shadcn");
    expect(Button).toBeDefined();
  });

  it("should import @notion-kit/sidebar without errors", async () => {
    const { Sidebar } = await import("@notion-kit/sidebar");
    expect(Sidebar).toBeDefined();
  });

  it("should import @notion-kit/single-image-dropzone without errors", async () => {
    const { SingleImageDropzone } = await import(
      "@notion-kit/single-image-dropzone"
    );
    expect(SingleImageDropzone).toBeDefined();
  });

  it("should import @notion-kit/table-view without errors", async () => {
    const { TableView } = await import("@notion-kit/table-view");
    expect(TableView).toBeDefined();
  });

  it("should import @notion-kit/tags-input without errors", async () => {
    const { TagsInput } = await import("@notion-kit/tags-input");
    expect(TagsInput).toBeDefined();
  });

  it("should import @notion-kit/tree without errors", async () => {
    const { Tree, useTree } = await import("@notion-kit/tree");
    expect(Tree).toBeDefined();
    expect(useTree).toBeDefined();
  });

  it("should import @notion-kit/unsplash without errors", async () => {
    const { Unsplash } = await import("@notion-kit/unsplash");
    expect(Unsplash).toBeDefined();
  });
});
