import type { Resource } from "i18next";

import deSettings from "./de/settings.json";
import enSettings from "./en/settings.json";
import esSettings from "./es/settings.json";
import frSettings from "./fr/settings.json";

export const ns = ["settings"] as const;
export const resources: Resource = {
  en: {
    settings: enSettings,
  },
  fr: {
    settings: frSettings,
  },
  de: {
    settings: deSettings,
  },
  es: {
    settings: esSettings,
  },
} as const;
export type { default as Resources } from "./types";
