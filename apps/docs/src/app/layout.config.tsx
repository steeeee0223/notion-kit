import Image from "next/image";
import type { DocsLayoutProps } from "fumadocs-ui/layouts/notebook";

import { source } from "@/lib/source";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: DocsLayoutProps = {
  githubUrl: "https://github.com/steeeee0223/notion-kit",
  tree: source.pageTree,
  nav: {
    title: (
      <>
        <Image src="/logo.svg" alt="" width={28} height={28} />
        Notion UI
      </>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
