"use client";

import React, { createContext, use, useMemo } from "react";

import { createAuthClient, type AuthClient } from "@notion-kit/auth";

const AuthContext = createContext<AuthClient | null>(null);

function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function useSession() {
  const authClient = useAuth();
  return authClient.useSession();
}

interface AuthProviderProps extends React.PropsWithChildren {
  baseURL?: string;
}

function AuthProvider({ baseURL, children }: AuthProviderProps) {
  const authClient = useMemo(() => createAuthClient(baseURL), [baseURL]);
  return <AuthContext value={authClient}>{children}</AuthContext>;
}

export { AuthProvider, useAuth, useSession };
