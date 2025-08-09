import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { cn } from "@notion-kit/cn";
import { ThemeProvider } from "@notion-kit/shadcn";

import "./global.css";

export const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Notion Table",
  icons: "/logo.svg",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(ibm_plex_mono.className, ibm_plex_mono.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
