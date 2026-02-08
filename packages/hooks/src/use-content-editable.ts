import { useCallback, useEffect, useRef } from "react";

interface UseContentEditableOptions {
  /** Current HTML content */
  value: string;
  /** Callback when content changes */
  onChange: (html: string) => void;
  /** Callback when element is blurred */
  onBlur?: () => void;
  /** When true, the element is not editable */
  readonly?: boolean;
}

interface UseContentEditableReturn<T extends HTMLElement> {
  /** Ref to attach to the contentEditable element */
  ref: React.RefObject<T | null>;
  /** Props to spread onto the contentEditable element */
  props: React.ComponentProps<"div">;
}

interface CursorPosition {
  node: Node;
  offset: number;
}

/**
 * Saves the current cursor position relative to the element
 */
function saveCursorPosition(element: HTMLElement): CursorPosition | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return null;

  return {
    node: range.startContainer,
    offset: range.startOffset,
  };
}

/**
 * Restores cursor position after DOM update
 * Since the DOM nodes may have been replaced, we need to find the equivalent position
 */
function restoreCursorPosition(
  element: HTMLElement,
  position: CursorPosition | null,
): void {
  if (!position) return;

  const selection = window.getSelection();
  if (!selection) return;

  // Try to restore to the exact node if it still exists
  if (element.contains(position.node)) {
    try {
      const range = document.createRange();
      range.setStart(position.node, position.offset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    } catch {
      // Node may have changed, fall through to text-based restoration
    }
  }

  // Fallback: restore by character offset from the start
  const textOffset = getTextOffset(element, position);
  if (textOffset !== null) {
    restoreByTextOffset(element, textOffset, selection);
  }
}

/**
 * Get the character offset from the start of the element
 */
function getTextOffset(
  element: HTMLElement,
  position: CursorPosition,
): number | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let offset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node === position.node) {
      return offset + position.offset;
    }
    offset += node.textContent?.length ?? 0;
  }

  return null;
}

/**
 * Restore cursor by text offset
 */
function restoreByTextOffset(
  element: HTMLElement,
  targetOffset: number,
  selection: Selection,
): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const nodeLength = node.textContent?.length ?? 0;

    if (currentOffset + nodeLength >= targetOffset) {
      try {
        const range = document.createRange();
        range.setStart(node, targetOffset - currentOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch {
        // Ignore if position is invalid
      }
      return;
    }
    currentOffset += nodeLength;
  }

  // If we couldn't find the position, place cursor at the end
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Hook for managing contentEditable elements with proper cursor position handling.
 *
 * Unlike controlled inputs, contentEditable elements lose cursor position when
 * their innerHTML is updated via React state. This hook preserves cursor position
 * across re-renders.
 *
 * @example
 * ```tsx
 * const { ref, props } = useContentEditable({
 *   value: caption,
 *   onChange: setCaption,
 * });
 *
 * return <div ref={ref} {...props} />;
 * ```
 *
 * @example Readonly mode
 * ```tsx
 * const { ref, props } = useContentEditable({
 *   value: caption,
 *   onChange: setCaption,
 *   readonly: true,
 * });
 *
 * return <div ref={ref} {...props} />;
 * ```
 */
export function useContentEditable<T extends HTMLElement = HTMLDivElement>({
  readonly,
  value,
  onChange,
  onBlur,
}: UseContentEditableOptions) {
  const ref = useRef<T>(null);
  const cursorPositionRef = useRef<CursorPosition | null>(null);
  const isUpdatingRef = useRef(false);

  // Handle input - save cursor position before state update
  const handleInput = useCallback(() => {
    const element = ref.current;
    if (!element || isUpdatingRef.current) return;

    // Save cursor position before React updates
    cursorPositionRef.current = saveCursorPosition(element);

    // Notify parent of the change
    onChange(element.innerHTML);
  }, [onChange]);

  // Handle blur
  const handleBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  // Restore cursor position after React re-renders
  useEffect(() => {
    const element = ref.current;
    if (!element || readonly) return;

    // Only restore if we have a saved position and the element is focused
    if (cursorPositionRef.current && document.activeElement === element) {
      isUpdatingRef.current = true;
      restoreCursorPosition(element, cursorPositionRef.current);
      isUpdatingRef.current = false;
    }
  }, [value, readonly]);

  // Sync initial content and subsequent external updates
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Only update if the element is not focused (to avoid cursor issues during external updates)
    if (document.activeElement !== element && element.innerHTML !== value) {
      element.innerHTML = value;
    }
  }, [value]);

  return {
    ref,
    props: readonly
      ? {
          contentEditable: false as const,
          tabIndex: -1,
          spellCheck: false,
          "aria-readonly": true as const,
        }
      : {
          contentEditable: true as const,
          tabIndex: 0,
          spellCheck: true,
          onInput: handleInput,
          onBlur: handleBlur,
        },
  } satisfies UseContentEditableReturn<T>;
}
