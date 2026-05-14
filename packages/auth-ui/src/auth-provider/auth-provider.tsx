import React, { createContext, use, useMemo } from "react";

import { createAuthClient, type AuthClient } from "@notion-kit/auth";

interface AuthContextInterface {
  auth: AuthClient;
  appURL: string;
  redirect?: (url: string) => void;
}

const AuthContext = createContext<AuthContextInterface | null>(null);

function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function useSession() {
  const { auth } = useAuth();
  return auth.useSession();
}

function usePasskeys() {
  const { auth } = useAuth();
  return auth.useListPasskeys();
}

function useActiveWorkspace() {
  const { auth } = useAuth();
  return auth.useActiveOrganization();
}

function useListWorkspaces() {
  const { auth } = useAuth();
  return auth.useListOrganizations();
}

interface AuthProviderProps extends React.PropsWithChildren {
  appURL?: string;
  authURL?: string;
  redirect?: (url: string) => void;
}

function resolveAppURL(appURL: string, url: string) {
  if (!appURL || /^https?:\/\//.test(url)) return url;
  const base = appURL.replace(/\/+$/, "");
  if (url === "/") return base;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

function AuthProvider({
  appURL,
  authURL,
  children,
  redirect,
}: AuthProviderProps) {
  const ctx = useMemo<AuthContextInterface>(() => {
    const auth = createAuthClient(authURL);
    const appBaseURL = appURL ?? "";
    return {
      auth,
      appURL: appBaseURL,
      redirect: (url) => {
        const resolvedURL = resolveAppURL(appBaseURL, url);
        if (redirect) {
          redirect(resolvedURL);
          return;
        }
        if (typeof window !== "undefined") {
          window.location.href = resolvedURL;
        }
      },
    };
  }, [appURL, authURL, redirect]);
  return <AuthContext value={ctx}>{children}</AuthContext>;
}

export {
  AuthProvider,
  useAuth,
  useSession,
  usePasskeys,
  useActiveWorkspace,
  useListWorkspaces,
};
