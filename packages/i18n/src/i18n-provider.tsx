"use client";

import React, { useEffect, useMemo } from "react";
import type { CustomTypeOptions } from "i18next";
import { I18nextProvider } from "react-i18next";

import { createI18n, setupLanguage } from "./config";

export interface I18nProviderProps extends React.PropsWithChildren {
  language?: string;
  defaultNS?: CustomTypeOptions["defaultNS"];
}

export function I18nProvider({
  children,
  language,
  defaultNS,
}: I18nProviderProps) {
  const i18n = useMemo(() => createI18n(), []);

  useEffect(() => {
    void setupLanguage(i18n, language);
  }, [language]);

  return (
    <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
      {children}
    </I18nextProvider>
  );
}
