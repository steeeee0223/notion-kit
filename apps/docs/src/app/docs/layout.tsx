import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...baseOptions}>{children}</DocsLayout>;
}
