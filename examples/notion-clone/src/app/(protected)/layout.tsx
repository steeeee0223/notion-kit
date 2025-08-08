"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@notion-kit/auth-ui";
import {
  SidebarInset,
  SidebarOpen,
  SidebarProvider,
} from "@notion-kit/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: React.PropsWithChildren) {
  const { data, isPending } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (data || isPending) return;
    router.push("/");
  }, [data, isPending, router]);

  if (!isPending && !data) return;
  return <CoreLayout>{children}</CoreLayout>;
}

function CoreLayout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarOpen />
          Navbar
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
