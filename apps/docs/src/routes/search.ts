import { createSearchAPI } from "fumadocs-core/search/server";

import { sources } from "@/lib/source";

import type { Route } from "./+types/search";

const { GET } = createSearchAPI("advanced", {
  indexes: async () =>
    Promise.all(
      Object.values(sources)
        .flatMap((source) => source.getPages())
        .map(async (page) => ({
          id: page.url,
          title: page.data.title,
          description: page.data.description,
          url: page.url,
          structuredData: await page.data.structuredData(),
        })),
    ),
});

export function loader({ request }: Route.LoaderArgs) {
  return GET(request);
}
