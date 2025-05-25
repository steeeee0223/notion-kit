import "./global.css";

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider";

import { cn } from "@notion-kit/cn";

import { ibm_plex_mono, inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Notion UI",
  icons: "/logo.svg",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(inter.className, ibm_plex_mono.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
