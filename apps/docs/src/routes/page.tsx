import { use } from "react";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { Link, useLocation } from "react-router";

import { mdxComponents } from "@/components/mdx-components";
import { pageTree, resolvePage, sections } from "@/lib/source";
import styles from "@/styles/docs.css?url";

import type { Route } from "./+types/page";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export async function loader({ request }: Route.LoaderArgs) {
  const resolved = resolvePage(new URL(request.url).pathname);
  if (!resolved)
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  await resolved.page.data.preload();
  return {
    title: resolved.page.data.title,
    description: resolved.page.data.description,
  };
}

export const meta: Route.MetaFunction = ({ loaderData: data }) => [
  { title: `${data.title} | Notion UI` },
  { name: "description", content: data.description },
];

export default function Page() {
  const { pathname } = useLocation();
  const resolved = resolvePage(pathname);
  if (!resolved) throw new Error("Documentation page is missing");
  const { page } = resolved;
  const MDX = page.data.body;
  const content = use(page.data.load());
  return (
    <DocsLayout
      tree={pageTree}
      nav={{ title: "Notion UI" }}
      githubUrl="https://github.com/steeeee0223/notion-kit"
      tabs={[...sections]}
    >
      <DocsPage
        toc={content.toc}
        full={page.data.full}
        className={page.data.full ? "max-w-none" : undefined}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        {page.data.links && (
          <div className="flex flex-wrap gap-2">
            {page.data.links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        <DocsBody>
          <MDX components={mdxComponents} />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}
