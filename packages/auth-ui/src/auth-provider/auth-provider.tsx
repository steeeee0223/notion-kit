"use client";

import React, { createContext, use, useMemo } from "react";

import { createAuthClient, type AuthClient } from "@notion-kit/auth";

interface AuthContextInterface {
  auth: AuthClient;
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

interface AuthProviderProps extends React.PropsWithChildren {
  baseURL?: string;
  redirect?: (url: string) => void;
}

function AuthProvider({ baseURL, children, redirect }: AuthProviderProps) {
  const ctx = useMemo<AuthContextInterface>(
    () => ({
      auth: createAuthClient(baseURL),
      redirect: (url: string) => {
        if (redirect) {
          redirect(url);
          return;
        }
        if (typeof window !== "undefined") {
          window.location.href = url;
        }
      },
    }),
    [baseURL, redirect],
  );
  return <AuthContext value={ctx}>{children}</AuthContext>;
}

export { AuthProvider, useAuth, useSession, usePasskeys };
