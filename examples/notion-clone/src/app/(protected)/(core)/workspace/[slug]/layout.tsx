"use client";

import { use, useEffect, useMemo } from "react";

import { useAuth, useListWorkspaces } from "@notion-kit/auth-ui";

interface LayoutProps {
  params: Promise<{ slug: string }>;
}

export default function Layout({
  params,
  children,
}: React.PropsWithChildren<LayoutProps>) {
  const { slug } = use(params);
  const { auth } = useAuth();
  const { data: workspaces, isPending } = useListWorkspaces();

  const organizationId = useMemo(() => {
    if (!workspaces) return null;
    const id = workspaces.find((org) => org.slug === slug)?.id;
    if (!id) {
      console.error("[workspace layout] Unexpected error", slug);
      return null;
    }
    return id;
  }, [slug, workspaces]);

  useEffect(() => {
    if (isPending || !organizationId) return;
    void auth.organization.setActive({ organizationId });
  }, [auth.organization, isPending, organizationId]);

  return children;
}
