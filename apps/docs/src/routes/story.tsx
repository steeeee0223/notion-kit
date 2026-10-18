import type { Story } from "@fumadocs/story/vite/client";
import { z } from "zod";

import { I18nProvider } from "@notion-kit/i18n";
import { registryIndex } from "@notion-kit/registry";
import { Toaster } from "@notion-kit/ui/primitives";

import { registryStories } from "@/stories/registry.story";
import styles from "@/styles/story.css?url";

import type { Route } from "./+types/story";

const modules = import.meta.glob<Record<string, Story>>(
  "../stories/development/**/*.story.tsx",
);
const registryName = z.enum(registryIndex);
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const segments = params["*"].split("/");
  const exportName = segments.pop();
  if (
    segments[0] === "registry" &&
    segments.length === 2 &&
    exportName === "story"
  ) {
    const index = registryName.safeParse(segments[1]);
    if (!index.success)
      throw new Response("Not Found", { status: 404, statusText: "Not Found" });
    return { story: registryStories[index.data] };
  }
  const load = modules[`../stories/${segments.join("/")}.story.tsx`];
  if (!load || !exportName)
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  const stories = await load();
  const story = stories[exportName];
  if (!story)
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  return { story };
}
clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <p>Loading example…</p>;
}

export default function StoryPage({ loaderData }: Route.ComponentProps) {
  const Frame = loaderData.story.Frame;
  return (
    <I18nProvider language="en">
      <main className="flex min-h-screen w-full items-center justify-center p-6">
        <Frame />
      </main>
      <Toaster />
    </I18nProvider>
  );
}
