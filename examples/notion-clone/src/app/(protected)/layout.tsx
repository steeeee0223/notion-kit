"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useActiveWorkspace, useSession } from "@notion-kit/auth-ui";

export default function Layout({ children }: React.PropsWithChildren) {
  const { data, isPending: isLoadingSession } = useSession();
  const { data: activeWorkspace, isPending: isLoadingActiveWorkspace } =
    useActiveWorkspace();
  const isPending = isLoadingSession || isLoadingActiveWorkspace;

  const router = useRouter();
  useEffect(() => {
    if (isPending) return;
    if (!data) {
      router.replace("/");
      return;
    }
    if (!data.session.activeOrganizationId || !activeWorkspace) {
      router.replace("/onboarding");
      return;
    }
    router.replace(`/workspace/${activeWorkspace.slug}`);
  }, [activeWorkspace, data, isPending, router]);

  if (!isPending && !data) return;
  return children;
}
