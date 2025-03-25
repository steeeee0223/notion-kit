import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";

import { baseOptions } from "@/app/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...baseOptions}>{children}</DocsLayout>;
}
