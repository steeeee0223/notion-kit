"use client";

import { use, useEffect } from "react";

import { useAuth } from "@notion-kit/auth-ui";

interface LayoutProps {
  params: Promise<{ slug: string }>;
}

export default function Layout({
  params,
  children,
}: React.PropsWithChildren<LayoutProps>) {
  const { slug } = use(params);
  const { auth } = useAuth();

  useEffect(() => {
    void auth.organization.setActive({ organizationSlug: slug });
  }, [auth.organization, slug]);

  return children;
}
