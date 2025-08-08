import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { AuthProvider } from "@notion-kit/auth-ui";
import { cn } from "@notion-kit/cn";
import { ThemeProvider, Toaster } from "@notion-kit/shadcn";

import { env } from "@/env";

import "./global.css";

export const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://notion-authn.vercel.app"
      : env.NEXT_PUBLIC_AUTH_URL,
  ),
  title: "Notion Auth Server",
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
        <AuthProvider baseURL={env.NEXT_PUBLIC_AUTH_URL}>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
            <Toaster className="font-mono" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
