import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

import type { RegistryIndex } from "@notion-kit/registry";

interface InstallationProps {
  packages: string;
  registryName: RegistryIndex;
}

export function Installation({ packages, registryName }: InstallationProps) {
  return (
    <Tabs items={["Notion Kit", "Shadcn"]}>
      <Tab value="Notion Kit">
        <DynamicCodeBlock lang="bash" code={`pnpm add ${packages}`} />
      </Tab>
      <Tab value="Shadcn">
        <DynamicCodeBlock
          lang="bash"
          code={`pnpm dlx shadcn@latest add https://notion-ui.vercel.app/registry/${registryName}.json`}
        />
      </Tab>
    </Tabs>
  );
}
