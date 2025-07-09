"use client";

import React, { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";

import { useSession } from "@notion-kit/auth-ui";

export default function Layout({ children }: React.PropsWithChildren) {
  const { data, isPending } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (data || isPending) return;
    router.push("/");
  }, [data, isPending, router]);

  if (!isPending && !data) redirect("/");
  return children;
}
