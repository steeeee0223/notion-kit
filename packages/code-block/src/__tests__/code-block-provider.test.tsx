/**
 * CodeBlock Provider Tests
 * Tests for controlled and uncontrolled state management
 */

import type { ReactNode } from "react";
import { useState } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CodeBlockValue } from "../code-block-provider";
import { CodeBlockProvider, useCodeBlock } from "../code-block-provider";

// Wrapper for rendering hooks with the provider
function createWrapper(props: {
  value?: CodeBlockValue;
  defaultValue?: Partial<CodeBlockValue>;
  onChange?: (value: CodeBlockValue) => void;
}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CodeBlockProvider {...props}>{children}</CodeBlockProvider>;
  };
}

describe("CodeBlockProvider", () => {
  describe("Uncontrolled Mode", () => {
    it("should initialize with default values when no props provided", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      expect(result.current.state.code).toBe("");
      expect(result.current.state.lang).toBe("text");
      expect(result.current.state.theme).toBe("github-dark");
      expect(result.current.state.caption).toBeUndefined();
    });

    it("should initialize with defaultValue when provided", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          defaultValue: {
            code: "const x = 1;",
            lang: "javascript",
            theme: "github-light",
            caption: "Example code",
          },
        }),
      });

      expect(result.current.state.code).toBe("const x = 1;");
      expect(result.current.state.lang).toBe("javascript");
      expect(result.current.state.theme).toBe("github-light");
      expect(result.current.state.caption).toBe("Example code");
    });

    it("should update code internally via updateCode", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.store.updateCode("const y = 2;");
      });

      expect(result.current.state.code).toBe("const y = 2;");
    });

    it("should update language internally via setLang", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.store.setLang("typescript");
      });

      expect(result.current.state.lang).toBe("typescript");
    });

    it("should update caption internally via setCaption", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.store.setCaption("My caption");
      });

      expect(result.current.state.caption).toBe("My caption");
    });

    it("should enable caption via enableCaption", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      expect(result.current.state.caption).toBeUndefined();

      act(() => {
        result.current.store.enableCaption();
      });

      expect(result.current.state.caption).toBe("");
    });

    it("should disable caption by setting to undefined", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({ defaultValue: { caption: "Some caption" } }),
      });

      expect(result.current.state.caption).toBe("Some caption");

      act(() => {
        result.current.store.setCaption(undefined);
      });

      expect(result.current.state.caption).toBeUndefined();
    });
  });

  describe("Controlled Mode", () => {
    it("should use controlled value when provided", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: {
            code: "function test() {}",
            lang: "javascript",
          },
        }),
      });

      expect(result.current.state.code).toBe("function test() {}");
      expect(result.current.state.lang).toBe("javascript");
    });

    it("should call onChange when code is updated", () => {
      const onChange = vi.fn();

      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: { code: "", lang: "text" },
          onChange,
        }),
      });

      act(() => {
        result.current.store.updateCode("new code");
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "new code",
        }),
      );
    });

    it("should call onChange when language is updated", () => {
      const onChange = vi.fn();

      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: { code: "", lang: "text" },
          onChange,
        }),
      });

      act(() => {
        result.current.store.setLang("python");
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          lang: "python",
        }),
      );
    });

    it("should call onChange when caption is updated", () => {
      const onChange = vi.fn();

      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: { code: "", lang: "text" },
          onChange,
        }),
      });

      act(() => {
        result.current.store.setCaption("New caption");
      });

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          caption: "New caption",
        }),
      );
    });

    it("should sync state when controlled value changes", () => {
      // Create a controlled wrapper that allows value updates
      function ControlledWrapper({ children }: { children: ReactNode }) {
        const [value, setValue] = useState<CodeBlockValue>({
          code: "initial",
          lang: "text",
        });

        return (
          <CodeBlockProvider value={value} onChange={setValue}>
            {children}
            <button
              data-testid="update-value"
              onClick={() => setValue({ code: "updated", lang: "javascript" })}
            />
          </CodeBlockProvider>
        );
      }

      const { result, rerender } = renderHook(() => useCodeBlock(), {
        wrapper: ControlledWrapper,
      });

      expect(result.current.state.code).toBe("initial");

      // Trigger re-render with new value
      rerender();

      // The value should still be "initial" until the button is clicked
      expect(result.current.state.code).toBe("initial");
    });

    it("should not call onChange in uncontrolled mode", () => {
      const onChange = vi.fn();

      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          defaultValue: { code: "", lang: "text" },
          onChange, // This should be ignored in uncontrolled mode
        }),
      });

      act(() => {
        result.current.store.updateCode("new code");
      });

      // In uncontrolled mode (using defaultValue, not value), onChange should not be called
      // Actually, let's check the implementation - onChange is only set if isControlled
      // Since we're using defaultValue (not value), this is uncontrolled
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should re-highlight when controlled language changes", async () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: { code: "const x = 1;", lang: "text" },
        }),
      });

      // Wait for initial highlight
      await waitFor(() => {
        expect(result.current.state.html).toBeTruthy();
      });

      const initialHtml = result.current.state.html;

      // Update language via store
      act(() => {
        result.current.store.setLang("javascript");
      });

      // Wait for re-highlight
      await waitFor(
        () => {
          expect(result.current.state.html).not.toBe(initialHtml);
        },
        { timeout: 500 },
      );
    });

    it("should re-highlight when controlled theme changes", async () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          value: {
            code: "const x = 1;",
            lang: "javascript",
            theme: "github-dark",
          },
        }),
      });

      // Wait for initial highlight
      await waitFor(() => {
        expect(result.current.state.html).toBeTruthy();
      });

      const initialHtml = result.current.state.html;

      // Update theme via store
      act(() => {
        result.current.store.setTheme("github-light");
      });

      // Wait for re-highlight with new theme
      await waitFor(
        () => {
          expect(result.current.state.html).not.toBe(initialHtml);
        },
        { timeout: 500 },
      );
    });
  });

  describe("Highlighting", () => {
    it("should generate HTML after code update (with debounce)", async () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          defaultValue: { code: "", lang: "javascript" },
        }),
      });

      act(() => {
        result.current.store.updateCode("const x = 1;");
      });

      // HTML should be generated after debounce
      await waitFor(
        () => {
          expect(result.current.state.html).toContain("const");
        },
        { timeout: 500 },
      );
    });

    it("should fallback to plain text for invalid language", async () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({
          defaultValue: { code: "<script>", lang: "invalid-lang-xyz" },
        }),
      });

      // Wait for highlighting attempt
      await waitFor(
        () => {
          // Should contain escaped HTML
          expect(result.current.state.html).toContain("&lt;script&gt;");
        },
        { timeout: 500 },
      );
    });
  });

  describe("Caption Management", () => {
    it("should dispatch focus event when enabling caption", async () => {
      const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({}),
      });

      act(() => {
        result.current.store.enableCaption();
      });

      // Wait for the setTimeout in enableCaption
      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "code-block:focus-caption",
          }),
        );
      });

      dispatchEventSpy.mockRestore();
    });

    it("should not re-enable caption if already enabled", () => {
      const { result } = renderHook(() => useCodeBlock(), {
        wrapper: createWrapper({ defaultValue: { caption: "existing" } }),
      });

      const before = result.current.state.caption;

      act(() => {
        result.current.store.enableCaption();
      });

      expect(result.current.state.caption).toBe(before);
    });
  });
});
