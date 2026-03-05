"use client";

import React, { createContext, use, useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "@notion-kit/i18n";
import { TooltipProvider } from "@notion-kit/shadcn";

import { getScopes } from "@/lib/scopes";
import { Scope, type SettingsAdapters } from "@/lib/types";
import { useAccount, useWorkspace } from "@/presets/hooks";

const ScopesContext = createContext<Set<Scope> | null>(null);
const SettingsApiContext = createContext<SettingsAdapters | null>(null);
const StripeContext = createContext<Promise<Stripe | null> | null>(null);

export function useScopes() {
  const ctx = use(ScopesContext);
  if (!ctx) throw new Error("useScopes must be used within SettingsProvider");
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
  adapters: SettingsAdapters;
  stripePublishableKey?: string;
}

export function SettingsProvider({
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
  const stripePromise = useMemo(
    () =>
      stripePublishableKey
        ? loadStripe(stripePublishableKey)
        : Promise.resolve(null),
    [stripePublishableKey],
  );
  return (
    <TooltipProvider delayDuration={500}>
      <SettingsApiContext value={adapters}>
        <StripeContext value={stripePromise}>
          <QueryClientProvider client={queryClient}>
            <SettingsProviderInner>{children}</SettingsProviderInner>
          </QueryClientProvider>
        </StripeContext>
      </SettingsApiContext>
    </TooltipProvider>
  );
}

function SettingsProviderInner({ children }: React.PropsWithChildren) {
  const { data: account } = useAccount();
  const { data: workspace } = useWorkspace();

  const scopes = useMemo(
    () => getScopes(workspace.plan, workspace.role),
    [workspace.plan, workspace.role],
  );

  return (
    <I18nProvider language={account.language} defaultNS="settings">
      <ScopesContext value={scopes}>{children}</ScopesContext>
    </I18nProvider>
  );
}
