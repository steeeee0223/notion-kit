const HOST_ATTRIBUTE = "data-notion-kit-dom-selector";

interface DomSelectionStyles {
  color: string;
  backgroundColor: string;
  opacity: string;
}

interface DomSelection {
  element: HTMLElement;
  tagName: string;
  cssSelector: string;
  rect: DOMRectReadOnly;
  styles: DomSelectionStyles;
}

interface SerializableDomSelection {
  tagName: string;
  cssSelector: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: DomSelectionStyles;
}

interface CreateDomSelectorOptions {
  onSelect?: (selection: DomSelection) => void;
  onCancel?: () => void;
}

interface DomSelectorController {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  readonly active: boolean;
}

const STYLES = `
  :host {
    all: initial;
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    pointer-events: none;
    color-scheme: light;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  * { box-sizing: border-box; }

  .highlight {
    position: fixed;
    display: none;
    border: 2px solid #2f81f7;
    background: rgb(47 129 247 / 18%);
    box-shadow: 0 0 0 1px rgb(255 255 255 / 85%) inset;
    pointer-events: none;
  }

  .label {
    position: absolute;
    left: -2px;
    bottom: 100%;
    max-width: min(480px, 90vw);
    padding: 4px 7px;
    overflow: hidden;
    border-radius: 4px 4px 0 0;
    background: #0969da;
    color: white;
    font: 600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .panel {
    position: fixed;
    top: 16px;
    right: 16px;
    display: none;
    width: min(360px, calc(100vw - 32px));
    overflow: hidden;
    border: 1px solid #d0d7de;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 12px 36px rgb(31 35 40 / 25%);
    color: #1f2328;
    pointer-events: auto;
  }

  .panel[data-open] { display: block; }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 12px;
    border-bottom: 1px solid #d8dee4;
    background: #f6f8fa;
  }

  .panel-title { font: 600 13px/1.4 inherit; }

  .close {
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: #57606a;
    cursor: pointer;
    font: 20px/1 inherit;
  }

  .close:hover { background: #eaeef2; color: #1f2328; }

  .panel-body { padding: 12px; }

  .selector {
    margin: 0 0 12px;
    padding: 8px;
    overflow-wrap: anywhere;
    border-radius: 6px;
    background: #f6f8fa;
    color: #0550ae;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .property {
    display: grid;
    grid-template-columns: 18px 116px 1fr;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    font: 12px/1.4 inherit;
  }

  .property-name { color: #57606a; }
  .property-value { overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

  .swatch {
    width: 16px;
    height: 16px;
    border: 1px solid rgb(31 35 40 / 20%);
    border-radius: 4px;
    background-color: var(--swatch);
    background-image: linear-gradient(45deg, #d0d7de 25%, transparent 25%),
      linear-gradient(-45deg, #d0d7de 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #d0d7de 75%),
      linear-gradient(-45deg, transparent 75%, #d0d7de 75%);
    background-position: 0 0, 0 5px, 5px -5px, -5px 0;
    background-size: 10px 10px;
  }

  .swatch::after {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: var(--swatch);
    content: "";
  }

  .opacity-placeholder { width: 16px; }

  .actions { display: flex; gap: 8px; margin-top: 12px; }

  .action {
    min-height: 32px;
    padding: 6px 10px;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    background: #f6f8fa;
    color: #24292f;
    cursor: pointer;
    font: 600 12px/1.4 inherit;
  }

  .action:hover { background: #f3f4f6; border-color: #afb8c1; }
  .action.primary { border-color: #1f6feb; background: #1f6feb; color: white; }
  .action.primary:hover { background: #0969da; }
`;

function escapeCss(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => {
    return `\\${character.codePointAt(0)?.toString(16)} `;
  });
}

function uniquelyMatches(element: HTMLElement, selector: string) {
  try {
    const matches = element.ownerDocument.querySelectorAll(selector);
    return matches.length === 1 && matches[0] === element;
  } catch {
    return false;
  }
}

function getElementSegment(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase();
  const classNames = [...element.classList].slice(0, 4);
  const withClasses = classNames.length
    ? `${tagName}.${classNames.map(escapeCss).join(".")}`
    : tagName;

  if (!element.parentElement) return withClasses;

  const siblings = [...element.parentElement.children].filter(
    (sibling) => sibling.tagName === element.tagName,
  );
  const position = siblings.indexOf(element) + 1;
  return siblings.length > 1
    ? `${withClasses}:nth-of-type(${position})`
    : withClasses;
}

function getCssSelector(element: HTMLElement) {
  if (element.id) {
    const idSelector = `#${escapeCss(element.id)}`;
    if (uniquelyMatches(element, idSelector)) return idSelector;
  }

  const classSelector = getElementSegment(element).replace(
    /:nth-of-type\(\d+\)$/,
    "",
  );
  if (uniquelyMatches(element, classSelector)) return classSelector;

  const segments: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== element.ownerDocument.documentElement) {
    if (current.id) {
      const idSelector = `#${escapeCss(current.id)}`;
      if (uniquelyMatches(current, idSelector)) {
        segments.unshift(idSelector);
        break;
      }
    }

    segments.unshift(getElementSegment(current));
    const candidate = segments.join(" > ");
    if (uniquelyMatches(element, candidate)) return candidate;
    current = current.parentElement;
  }

  if (current === element.ownerDocument.documentElement) {
    segments.unshift("html");
  }

  return segments.join(" > ");
}

function toSerializableSelection(
  selection: DomSelection,
): SerializableDomSelection {
  const { element: _element, rect, ...serializable } = selection;
  return {
    ...serializable,
    rect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}

async function copyText(text: string, root: ShadowRoot) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px";
    root.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function createDomSelector(
  options: CreateDomSelectorOptions = {},
): DomSelectorController {
  if (typeof document === "undefined") {
    throw new Error("DomSelector requires a browser document.");
  }

  let active = false;
  let destroyed = false;
  let highlightedElement: HTMLElement | null = null;
  let selection: DomSelection | null = null;
  let animationFrame = 0;
  let previousCursor: string | null = null;

  const host = document.createElement("div");
  host.setAttribute(HOST_ATTRIBUTE, "");
  const shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = STYLES;

  const highlight = document.createElement("div");
  highlight.className = "highlight";
  const highlightLabel = document.createElement("div");
  highlightLabel.className = "label";
  highlight.append(highlightLabel);

  const panel = document.createElement("section");
  panel.className = "panel";
  panel.setAttribute("aria-label", "DOM selector result");

  const panelHeader = document.createElement("header");
  panelHeader.className = "panel-header";
  const panelTitle = document.createElement("strong");
  panelTitle.className = "panel-title";
  panelTitle.textContent = "DOM Selector";
  const closeButton = document.createElement("button");
  closeButton.className = "close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close DOM selector");
  closeButton.textContent = "×";
  panelHeader.append(panelTitle, closeButton);

  const panelBody = document.createElement("div");
  panelBody.className = "panel-body";
  const selectorOutput = document.createElement("p");
  selectorOutput.className = "selector";

  const propertyRows = {
    color: createPropertyRow("Color", true),
    backgroundColor: createPropertyRow("Background", true),
    opacity: createPropertyRow("Opacity", false),
  };

  const actions = document.createElement("div");
  actions.className = "actions";
  const copyButton = document.createElement("button");
  copyButton.className = "action primary";
  copyButton.type = "button";
  copyButton.textContent = "Copy JSON";
  const selectAgainButton = document.createElement("button");
  selectAgainButton.className = "action";
  selectAgainButton.type = "button";
  selectAgainButton.textContent = "Select again";
  actions.append(copyButton, selectAgainButton);

  panelBody.append(
    selectorOutput,
    propertyRows.color.row,
    propertyRows.backgroundColor.row,
    propertyRows.opacity.row,
    actions,
  );
  panel.append(panelHeader, panelBody);
  shadowRoot.append(style, highlight, panel);
  document.documentElement.append(host);

  function createPropertyRow(label: string, showSwatch: boolean) {
    const row = document.createElement("div");
    row.className = "property";
    const swatch = document.createElement("span");
    swatch.className = showSwatch ? "swatch" : "opacity-placeholder";
    const name = document.createElement("span");
    name.className = "property-name";
    name.textContent = label;
    const value = document.createElement("span");
    value.className = "property-value";
    row.append(swatch, name, value);
    return { row, swatch, value };
  }

  function getTarget(event: Event) {
    const target = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement &&
          node !== host &&
          !host.contains(node) &&
          node !== document.documentElement &&
          node !== document.body,
      );
    return target ?? null;
  }

  function updateHighlight() {
    animationFrame = 0;
    if (!active || !highlightedElement?.isConnected) {
      highlight.style.display = "none";
      return;
    }

    const rect = highlightedElement.getBoundingClientRect();
    highlight.style.display = "block";
    highlight.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlightLabel.textContent = `${highlightedElement.tagName.toLowerCase()}  ${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    const labelHeight = highlightLabel.getBoundingClientRect().height;
    if (rect.top < labelHeight) {
      highlightLabel.style.top = "100%";
      highlightLabel.style.bottom = "auto";
      highlightLabel.style.borderRadius = "0 0 4px 4px";
    } else {
      highlightLabel.style.top = "auto";
      highlightLabel.style.bottom = "100%";
      highlightLabel.style.borderRadius = "4px 4px 0 0";
    }
  }

  function scheduleHighlightUpdate() {
    if (!animationFrame)
      animationFrame = requestAnimationFrame(updateHighlight);
  }

  function handlePointerMove(event: PointerEvent) {
    highlightedElement = getTarget(event);
    scheduleHighlightUpdate();
  }

  function handleClick(event: MouseEvent) {
    const element = highlightedElement ?? getTarget(event);
    if (!element?.isConnected) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const computedStyle = getComputedStyle(element);
    const sourceRect = element.getBoundingClientRect();
    const rect = new DOMRectReadOnly(
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
    );
    selection = {
      element,
      tagName: element.tagName,
      cssSelector: getCssSelector(element),
      rect,
      styles: {
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        opacity: computedStyle.opacity,
      },
    };

    stop();
    renderSelection(selection);
    console.log("[DOM Selector]", selection);
    options.onSelect?.(selection);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    stop();
    options.onCancel?.();
  }

  function renderSelection(nextSelection: DomSelection) {
    selectorOutput.textContent = nextSelection.cssSelector;
    propertyRows.color.value.textContent = nextSelection.styles.color;
    propertyRows.color.swatch.style.setProperty(
      "--swatch",
      nextSelection.styles.color,
    );
    propertyRows.backgroundColor.value.textContent =
      nextSelection.styles.backgroundColor;
    propertyRows.backgroundColor.swatch.style.setProperty(
      "--swatch",
      nextSelection.styles.backgroundColor,
    );
    propertyRows.opacity.value.textContent = nextSelection.styles.opacity;
    panel.setAttribute("data-open", "");
  }

  function addSelectionListeners() {
    document.addEventListener("pointermove", handlePointerMove, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", scheduleHighlightUpdate, true);
    window.addEventListener("resize", scheduleHighlightUpdate);
  }

  function removeSelectionListeners() {
    document.removeEventListener("pointermove", handlePointerMove, true);
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("scroll", scheduleHighlightUpdate, true);
    window.removeEventListener("resize", scheduleHighlightUpdate);
  }

  function start() {
    if (destroyed || active) return;
    active = true;
    highlightedElement = null;
    panel.removeAttribute("data-open");
    highlight.style.display = "none";
    previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "crosshair";
    addSelectionListeners();
  }

  function stop() {
    if (!active) return;
    active = false;
    highlightedElement = null;
    highlight.style.display = "none";
    document.documentElement.style.cursor = previousCursor ?? "";
    previousCursor = null;
    removeSelectionListeners();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    selection = null;
    host.remove();
  }

  async function handleCopy() {
    if (!selection) return;
    const previousLabel = copyButton.textContent;
    const json = JSON.stringify(toSerializableSelection(selection), null, 2);
    await copyText(json, shadowRoot);
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = previousLabel;
    }, 1200);
  }

  copyButton.addEventListener("click", () => void handleCopy());
  selectAgainButton.addEventListener("click", start);
  closeButton.addEventListener("click", destroy);

  return {
    start,
    stop,
    destroy,
    get active() {
      return active;
    },
  };
}

export { createDomSelector, getCssSelector, toSerializableSelection };
export type {
  CreateDomSelectorOptions,
  DomSelection,
  DomSelectionStyles,
  DomSelectorController,
  SerializableDomSelection,
};
