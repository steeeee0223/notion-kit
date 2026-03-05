"use client";

import React, { createContext, use, useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "@notion-kit/i18n";
import { TooltipProvider } from "@notion-kit/shadcn";

import type { SettingsAdapters, SettingsStore } from "../lib";
import { getScopes, Scope } from "../lib";

interface SettingsContextInterface {
  settings: SettingsStore;
  scopes: Set<Scope>;
}

const SettingsContext = createContext<SettingsContextInterface | null>(null);
const SettingsApiContext = createContext<SettingsAdapters | null>(null);
const StripeContext = createContext<Promise<Stripe | null> | null>(null);

export function useSettings() {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function useSettingsApi() {
  const ctx = use(SettingsApiContext);
  if (!ctx)
    throw new Error("useSettingsApi must be used within SettingsProvider");
  return ctx;
}

export function useStripePromise() {
  const ctx = use(StripeContext);
  if (!ctx)
    throw new Error("useStripePromise must be used within SettingsProvider");
  return ctx;
}

export interface SettingsProviderProps extends React.PropsWithChildren {
  settings: SettingsStore;
  adapters: SettingsAdapters;
  stripePublishableKey?: string;
}

export function SettingsProvider({
  settings,
  adapters,
  stripePublishableKey,
  children,
}: SettingsProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      }),
  );
  const contextValue = useMemo(
    () => ({
      settings,
      scopes: getScopes(settings.workspace.plan, settings.workspace.role),
    }),
    [settings],
  );
  const stripePromise = useMemo(
    () =>
      stripePublishableKey
        ? loadStripe(stripePublishableKey)
        : Promise.resolve(null),
    [stripePublishableKey],
  );
  return (
    <I18nProvider language={settings.account.language} defaultNS="settings">
      <TooltipProvider delayDuration={500}>
        <SettingsContext value={contextValue}>
          <SettingsApiContext value={adapters}>
            <StripeContext value={stripePromise}>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </StripeContext>
          </SettingsApiContext>
        </SettingsContext>
      </TooltipProvider>
    </I18nProvider>
  );
}
