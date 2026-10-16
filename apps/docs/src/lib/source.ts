import { loader } from "fumadocs-core/source";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

const schema = pageSchema.extend({
  links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
});
const docs = defineDocs({ dir: "content/docs", docs: { async: true, schema } });
const registry = defineDocs({
  dir: "content/registry",
  docs: { async: true, schema },
});
const development = defineDocs({
  dir: "content/development",
  docs: { async: true, schema },
});

export const sources = {
  docs: loader({ baseUrl: "/docs", source: docs.toFumadocsSource() }),
  registry: loader({
    baseUrl: "/registry",
    source: registry.toFumadocsSource(),
  }),
  development: loader({
    baseUrl: "/development",
    source: development.toFumadocsSource(),
  }),
};

export const sections = [
  {
    key: "docs",
    title: "Docs",
    description: "Component documentation",
    url: "/docs",
  },
  {
    key: "registry",
    title: "Registry",
    description: "Installable component examples",
    url: "/registry",
  },
  {
    key: "development",
    title: "Development",
    description: "Additional component scenarios",
    url: "/development",
  },
] as const;

export const pageTree = {
  name: "Notion UI",
  children: sections.map(({ key, title }) => ({
    type: "folder" as const,
    name: title,
    root: true,
    children: sources[key].pageTree.children,
  })),
};

export function resolvePage(pathname: string) {
  const [section, ...slugs] = pathname.split("/").filter(Boolean);
  if (section !== "docs" && section !== "registry" && section !== "development")
    return;
  const page = sources[section].getPage(slugs);
  if (page) return { section, page };
}
