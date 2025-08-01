"use client";

import React, { createContext, use, useMemo, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { I18nProvider } from "@notion-kit/i18n";
import { ModalProvider } from "@notion-kit/modal";
import { Role } from "@notion-kit/schemas";
import {
  TooltipProvider,
  useTheme,
  type UseThemeProps,
} from "@notion-kit/shadcn";

import type {
  Connection,
  ConnectionStrategy,
  Passkey,
  SessionRow,
  SettingsStore,
  UpdateSettings,
} from "../lib";
import { getScopes, Scope } from "../lib";

export interface SettingsActions {
  updateSettings?: UpdateSettings;
  uploadFile?: (file: File) => Promise<void>;
  /** Account */
  account?: {
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
    delete?: (workspaceId: string) => Promise<void>;
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
    add?: (emails: string[], role: Role) => Promise<void>;
    update?: (id: string, role: Role) => Promise<void>;
    delete?: (id: string) => Promise<void>;
  };
}

interface SettingsContextInterface
  extends Pick<UseThemeProps, "theme" | "setTheme">,
    SettingsActions {
  settings: SettingsStore;
  scopes: Set<Scope>;
}

const SettingsContext = createContext<SettingsContextInterface | null>(null);

export function useSettings() {
  const object = use(SettingsContext);
  if (!object)
    throw new Error("useSettings must be used within SettingsProvider");
  return object;
}

const queryClient = new QueryClient();

export interface SettingsProviderProps
  extends React.PropsWithChildren,
    SettingsActions {
  settings: SettingsStore;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  settings,
  children,
  ...actions
}) => {
  const { theme, setTheme } = useTheme();

  const actionsRef = useRef(actions);
  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      settings,
      scopes: getScopes(settings.workspace.plan, settings.workspace.role),
      ...actionsRef.current,
    }),
    [theme, setTheme, settings],
  );
  return (
    <I18nProvider language={settings.account.language} defaultNS="settings">
      <TooltipProvider delayDuration={500}>
        <SettingsContext value={contextValue}>
          <QueryClientProvider client={queryClient}>
            <ModalProvider>{children}</ModalProvider>
          </QueryClientProvider>
        </SettingsContext>
      </TooltipProvider>
    </I18nProvider>
  );
};
