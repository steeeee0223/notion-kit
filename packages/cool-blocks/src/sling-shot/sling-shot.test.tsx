import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import { SlingShot } from "./sling-shot";

it("SlingShot_ResetKeyDuringDrag_ResetsTheItemWithoutRemounting", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const onLaunch = vi.fn();

  function render(resetKey: number) {
    act(() => {
      root.render(
        <SlingShot
          config={{ shake: false }}
          onLaunch={onLaunch}
          resetKey={resetKey}
        >
          <SlingShot.Item>Item</SlingShot.Item>
          <SlingShot.Arrow />
        </SlingShot>,
      );
    });
  }

  function dispatchPointer(target: EventTarget, type: string, clientX: number) {
    act(() => {
      target.dispatchEvent(
        new PointerEvent(type, { bubbles: true, clientX, pointerId: 1 }),
      );
    });
  }

  try {
    render(0);
    const item = container.querySelector<HTMLElement>(
      '[data-slot="sling-shot-item"]',
    );
    if (!item) throw new Error("Missing SlingShot item");
    const initialTransform = item.style.transform;

    dispatchPointer(item, "pointerdown", 0);
    dispatchPointer(window, "pointermove", 40);
    expect(item.style.transform).not.toBe(initialTransform);
    expect(
      container.querySelector('[data-slot="sling-shot-arrow"]'),
    ).not.toBeNull();

    render(1);

    expect(container.querySelector('[data-slot="sling-shot-item"]')).toBe(item);
    expect(item.style.transform).toBe(initialTransform);
    expect(
      container.querySelector('[data-slot="sling-shot-arrow"]'),
    ).toBeNull();
    dispatchPointer(window, "pointerup", 40);
    expect(onLaunch).not.toHaveBeenCalled();
  } finally {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
