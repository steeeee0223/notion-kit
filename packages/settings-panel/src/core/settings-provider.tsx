"use client";

import React, { createContext, use, useMemo } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "@notion-kit/i18n";
import { Plan, Role, type IconData } from "@notion-kit/schemas";
import { TooltipProvider } from "@notion-kit/shadcn";

import type { BillingAddress } from "@/presets/modals/change-billing-address";

import type {
  AccountStore,
  BillingStore,
  Connection,
  ConnectionStrategy,
  Invitations,
  Memberships,
  Passkey,
  SessionRow,
  SettingsStore,
  TeamspacePermission,
  TeamspaceRole,
  Teamspaces,
  WorkspaceStore,
} from "../lib";
import { getScopes, Scope } from "../lib";

export interface SettingsActions {
  uploadFile?: (file: File) => Promise<void>;
  /** Account */
  account?: {
    update?: (data: Partial<Omit<AccountStore, "id">>) => Promise<void>;
    delete?: (data: { accountId: string; email: string }) => Promise<void>;
    sendEmailVerification?: (email: string) => Promise<void>;
    changePassword?: (data: {
      newPassword: string;
      currentPassword: string;
    }) => Promise<void>;
    setPassword?: (newPassword: string) => Promise<void>;
  };
  sessions?: {
    getAll?: () => Promise<SessionRow[]>;
    delete?: (token: string) => Promise<void>;
    deleteAll?: () => Promise<void>;
  };
  passkeys?: {
    getAll?: () => Promise<Passkey[]>;
    add?: () => Promise<boolean>;
    update?: (data: { id: string; name: string }) => Promise<void>;
    delete?: (id: string) => Promise<void>;
  };
  /** Workspace */
  workspace?: {
    update?: (data: Partial<Omit<WorkspaceStore, "id">>) => Promise<void>;
    delete?: (id: string) => Promise<void>;
    leave?: (id: string) => Promise<void>;
    resetLink?: () => Promise<void>;
  };
  /** Connections */
  connections?: {
    getAll?: () => Promise<Connection[]>;
    add?: (strategy: ConnectionStrategy) => Promise<void>;
    delete?: (connection: Connection) => Promise<void>;
  };
  /** People */
  people?: {
    getAll?: () => Promise<Memberships>;
    update?: (data: {
      id: string;
      memberId: string;
      role: Role;
    }) => Promise<void>;
    delete?: (data: { id: string; memberId: string }) => Promise<void>;
  };
  invitations?: {
    getAll?: () => Promise<Invitations>;
    add?: (data: { emails: string[]; role: Role }) => Promise<void>;
    cancel?: (id: string) => Promise<void>;
  };
  /** Teamspaces */
  teamspaces?: {
    getAll?: () => Promise<Teamspaces>;
    add?: (data: {
      name: string;
      icon: IconData;
      description?: string;
      permission: TeamspacePermission;
    }) => Promise<void>;
    update?: (data: {
      id: string;
      name?: string;
      icon?: IconData;
      description?: string;
      permission?: TeamspacePermission;
    }) => Promise<void>;
    delete?: (teamspaceId: string) => Promise<void>;
    leave?: (teamspaceId: string) => Promise<void>;
    addMembers?: (data: {
      teamspaceId: string;
      userIds: string[];
      role: TeamspaceRole;
    }) => Promise<void>;
    updateMember?: (data: {
      teamspaceId: string;
      userId: string;
      role: TeamspaceRole;
    }) => Promise<void>;
    deleteMember?: (data: {
      teamspaceId: string;
      userId: string;
    }) => Promise<void>;
  };
  /** Billing */
  billing?: {
    getAll?: () => Promise<BillingStore>;
    changePlan?: (plan: Plan) => Promise<void>;
    editMethod?: () => Promise<void>;
    editBilledTo?: (
      address: BillingAddress & { businessName: string },
    ) => Promise<void>;
    editEmail?: (email: string) => Promise<void>;
    toggleInvoiceEmails?: (checked: boolean) => void;
    editVat?: () => void;
    viewInvoice?: () => void;
  };
}

interface SettingsContextInterface {
  settings: SettingsStore;
  scopes: Set<Scope>;
}

const SettingsContext = createContext<SettingsContextInterface | null>(null);
const SettingsApiContext = createContext<SettingsActions | null>(null);
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export interface SettingsProviderProps
  extends React.PropsWithChildren,
    SettingsActions {
  settings: SettingsStore;
  stripePublishableKey: string;
}

export function SettingsProvider({
  settings,
  stripePublishableKey,
  children,
  ...actions
}: SettingsProviderProps) {
  const actionsApi = useMemo(() => actions, [actions]);
  const contextValue = useMemo(
    () => ({
      settings,
      scopes: getScopes(settings.workspace.plan, settings.workspace.role),
    }),
    [settings],
  );
  const stripePromise = useMemo(
    () => loadStripe(stripePublishableKey),
    [stripePublishableKey],
  );
  return (
    <I18nProvider language={settings.account.language} defaultNS="settings">
      <TooltipProvider delayDuration={500}>
        <SettingsContext value={contextValue}>
          <SettingsApiContext value={actionsApi}>
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
