/**
 * Tests to verify that built packages can be imported and rendered without errors.
 * This ensures that the React Compiler runtime is correctly configured.
 */
import { describe, expect, it } from "vitest";

describe("Package Import Tests", () => {
  it("should import @notion-kit/auth without errors", async () => {
    const { createAuth, createAuthClient } = await import("@notion-kit/auth");
    const auth = createAuth({
      POSTGRES_URL: "API_KEY",
      BETTER_AUTH_URL: "API_KEY",
      BETTER_AUTH_SECRET: "API_KEY",
      TRUSTED_ORIGINS: [],
      GOOGLE_CLIENT_ID: "API_KEY",
      GOOGLE_CLIENT_SECRET: "API_KEY",
      GITHUB_CLIENT_ID: "API_KEY",
      GITHUB_CLIENT_SECRET: "API_KEY",
      NODE_ENV: "test",
      MAILTRAP_API_KEY: "API_KEY",
    });
    expect(auth).toBeDefined();

    const authClient = createAuthClient();
    expect(authClient).toBeDefined();
  });

  it("should import @notion-kit/auth-ui without errors", async () => {
    const { LoginForm } = await import("@notion-kit/auth-ui");
    expect(LoginForm).toBeDefined();
  });

  it("should import @notion-kit/cn without errors", async () => {
    const { cn } = await import("@notion-kit/cn");
    expect(cn).toBeDefined();
  });

  it("should import @notion-kit/ui/cover without errors", async () => {
    const { Cover } = await import("@notion-kit/ui/cover");
    expect(Cover).toBeDefined();
  });

  it("should import @notion-kit/hooks without errors", async () => {
    const hooks = await import("@notion-kit/hooks");
    expect(hooks).toBeDefined();
  });

  it("should import @notion-kit/i18n without errors", async () => {
    const { I18nProvider } = await import("@notion-kit/i18n");
    expect(I18nProvider).toBeDefined();
  });

  it("should import @notion-kit/ui/icon-block without errors", async () => {
    const { IconBlock } = await import("@notion-kit/ui/icon-block");
    expect(IconBlock).toBeDefined();
  }, 10000); // Longer timeout for large package

  it("should import @notion-kit/ui/icon-menu without errors", async () => {
    const { IconMenu } = await import("@notion-kit/ui/icon-menu");
    expect(IconMenu).toBeDefined();
  });

  it("should import @notion-kit/icons without errors", async () => {
    const { Icon } = await import("@notion-kit/icons");
    expect(Icon).toBeDefined();
  });

  it("should import @notion-kit/ui/navbar without errors", async () => {
    const { Navbar } = await import("@notion-kit/ui/navbar");
    expect(Navbar).toBeDefined();
  });

  it("should import @notion-kit/ui/selectable without errors", async () => {
    const { Selectable, useSelectable, useSelectableItem } = await import(
      "@notion-kit/ui/selectable"
    );
    expect(Selectable).toBeDefined();
    expect(useSelectable).toBeDefined();
    expect(useSelectableItem).toBeDefined();
  });

  it("should import @notion-kit/settings-panel without errors", async () => {
    const { SettingsPanel } = await import("@notion-kit/settings-panel");
    expect(SettingsPanel).toBeDefined();
  });

  it("should import @notion-kit/ui/primitives without errors", async () => {
    const { Button, Calendar } = await import("@notion-kit/ui/primitives");
    expect(Button).toBeDefined();
    expect(Calendar).toBeDefined();
  });

  it("should import @notion-kit/ui/sidebar without errors", async () => {
    const { Sidebar } = await import("@notion-kit/ui/sidebar");
    expect(Sidebar).toBeDefined();
  });

  it("should import @notion-kit/ui/single-image-dropzone without errors", async () => {
    const { SingleImageDropzone } = await import(
      "@notion-kit/ui/single-image-dropzone"
    );
    expect(SingleImageDropzone).toBeDefined();
  });

  it("should import @notion-kit/table-view without errors", async () => {
    const { TableView } = await import("@notion-kit/table-view");
    expect(TableView).toBeDefined();
  });

  it("should import @notion-kit/ui/tags-input without errors", async () => {
    const { TagsInput } = await import("@notion-kit/ui/tags-input");
    expect(TagsInput).toBeDefined();
  });

  it("should import @notion-kit/ui/tree without errors", async () => {
    const { Tree, useTree } = await import("@notion-kit/ui/tree");
    expect(Tree).toBeDefined();
    expect(useTree).toBeDefined();
  });

  it("should import @notion-kit/ui/unsplash without errors", async () => {
    const { Unsplash } = await import("@notion-kit/ui/unsplash");
    expect(Unsplash).toBeDefined();
  });
});
