import {
  createDomSelector,
  type DomSelectorController,
} from "./dom-selector/core";

declare global {
  var __DOM_SELECTOR__: DomSelectorController | undefined;
}

globalThis.__DOM_SELECTOR__?.destroy();
globalThis.__DOM_SELECTOR__ = createDomSelector();
globalThis.__DOM_SELECTOR__.start();
