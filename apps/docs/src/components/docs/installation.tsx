"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { PackageIcon, RocketIcon } from "lucide-react";
import { tv } from "tailwind-variants";

import { cn } from "@notion-kit/cn";
import {
  TabsTrigger as Tab,
  Tabs,
  TabsContent,
  TabsList,
} from "@notion-kit/shadcn";

import { ibm_plex_mono } from "@/lib/fonts";

const installationStyles = tv({
  slots: {
    tab: cn(ibm_plex_mono.className, "font-normal [&_svg]:mr-2"),
    content:
      "bg-main text-xs [&_figure]:rounded-none [&_figure]:rounded-b-lg [&_figure]:border-none",
  },
});

interface InstallationProps {
  packages: string;
  registryName: string;
}

function Installation({ packages, registryName }: InstallationProps) {
  const { tab, content } = installationStyles();

  return (
    <Tabs defaultValue="notion-kit">
      <TabsList>
        <Tab value="notion-kit" className={tab()}>
          <RocketIcon /> Notion Kit
        </Tab>
        <Tab value="shadcn" className={tab()}>
          <PackageIcon /> Shadcn
        </Tab>
      </TabsList>
      <TabsContent value="notion-kit" className={content()}>
        <DynamicCodeBlock lang="bash" code={`pnpm add ${packages}`} />
      </TabsContent>
      <TabsContent value="shadcn" className={content()}>
        <DynamicCodeBlock
          lang="bash"
          code={`pnpm dlx shadcn@latest add https://notion-ui.vercel.app/registry/${registryName}.json`}
        />
      </TabsContent>
    </Tabs>
  );
}

export { Installation };
