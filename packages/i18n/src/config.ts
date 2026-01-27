import i18next, { type i18n as i18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { ns, resources } from "./resources";

const STORAGE_KEY = "nk:i18n:lng";

export function createI18n(): i18nInstance {
  const i18n = i18next.createInstance();
  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources,
      ns,
      lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
      // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
      // if you're using a language detector, do not define the lng option
      fallbackLng: "en",
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    })
    .then(() => console.info("[i18n] init success"))
    .catch(() => console.error("[i18n] init failed"));

  if (typeof globalThis.localStorage !== "undefined") {
    i18n.on("languageChanged", (lng) => {
      localStorage.setItem(STORAGE_KEY, lng);
    });
  }
  return i18n;
}

export function setupLanguage(i: i18nInstance, language?: string) {
  const localStorageLanguage = localStorage.getItem(STORAGE_KEY);
  // You can standardize locales here
  // Refer to https://github.com/toeverything/AFFiNE/blob/canary/packages/frontend/i18n/src/index.ts
  const lng = language ?? localStorageLanguage ?? navigator.language;
  return i.changeLanguage(lng);
}
