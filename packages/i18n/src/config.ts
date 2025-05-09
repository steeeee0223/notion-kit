import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";

import { ns, resources } from "./resources";

const STORAGE_KEY = "i18n_lng";

type CreateI18n = () => i18n;

export const createI18n: CreateI18n = () => {
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (globalThis.localStorage) {
    i18n.on("languageChanged", (lng) => {
      localStorage.setItem(STORAGE_KEY, lng);
    });
  }
  return i18n;
};

export const setupLanguage = (i: i18n, language?: string) => {
  const localStorageLanguage = localStorage.getItem(STORAGE_KEY);
  // You can standardize locales here
  // Refer to https://github.com/toeverything/AFFiNE/blob/canary/packages/frontend/i18n/src/index.ts
  const lng = language ?? localStorageLanguage ?? navigator.language;
  return i.changeLanguage(lng);
};
