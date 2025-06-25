"use client";

import React, { createContext, useContext, useMemo, useRef } from "react";

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
    logoutAll?: () => Promise<void>;
    logoutSession?: (token: string) => Promise<void>;
  };
  /** Workspace */
  workspace?: {
    delete?: (workspaceId: string) => Promise<void>;
    resetLink?: () => Promise<void>;
  };
  /** Connections */
  connections?: {
    load?: () => Promise<Connection[]>;
    add?: (strategy: ConnectionStrategy) => Promise<void>;
    delete?: (connectionId: string) => Promise<void>;
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
  const object = useContext(SettingsContext);
  if (!object)
    throw new Error("useSettings must be used within SettingsProvider");
  return object;
}

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
        <SettingsContext.Provider value={contextValue}>
          <ModalProvider>{children}</ModalProvider>
        </SettingsContext.Provider>
      </TooltipProvider>
    </I18nProvider>
  );
};
