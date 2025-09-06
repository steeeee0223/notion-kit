"use client";

import React, { createContext, use, useMemo } from "react";
import { v4 } from "uuid";

import { createAuthClient, type AuthClient } from "@notion-kit/auth";

import { toSlugLike } from "../lib";

interface AuthContextInterface {
  auth: AuthClient;
  baseURL: string;
  generateUniqueSlug: (name: string) => Promise<string>;
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
  baseURL?: string;
  redirect?: (url: string) => void;
}

function AuthProvider({ baseURL, children, redirect }: AuthProviderProps) {
  const ctx = useMemo<AuthContextInterface>(() => {
    const auth = createAuthClient(baseURL);
    return {
      auth,
      baseURL: baseURL ?? "",
      generateUniqueSlug: async (name) => {
        const baseSlug = toSlugLike(name);
        let slug = baseSlug;
        let counter = 0;

        while (counter < 10) {
          const res = await auth.organization.checkSlug({ slug });
          if (!res.error) break;
          const id = v4();
          slug = `${baseSlug}-${id.slice(0, 8)}`;
          counter++;
        }

        // The slug is guaranteed to be unique at this point if counter < 10
        return slug;
      },
      redirect: (url) => {
        if (redirect) {
          redirect(url);
          return;
        }
        if (typeof window !== "undefined") {
          window.location.href = url;
        }
      },
    };
  }, [baseURL, redirect]);
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
