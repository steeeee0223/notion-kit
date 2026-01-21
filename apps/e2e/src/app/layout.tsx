import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Test Packages - notion-kit",
  description: "Testing built packages for render errors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
