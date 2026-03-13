import i18next, { type i18n as i18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { ns, resources } from "./resources";

const STORAGE_KEY = "nk:i18n:lng";

export function getLanguage(language?: string) {
  const isClient = typeof globalThis.localStorage !== "undefined";
  const localStorageLanguage = isClient
    ? localStorage.getItem(STORAGE_KEY)
    : null;
  const navigatorLanguage =
    typeof navigator !== "undefined" ? navigator.language : "en";
  return language ?? localStorageLanguage ?? navigatorLanguage;
}

export function createI18n(language?: string): i18nInstance {
  const i18n = i18next.createInstance();
  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
      resources,
      ns,
      lng: getLanguage(language), // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
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
  return i.changeLanguage(getLanguage(language));
}
