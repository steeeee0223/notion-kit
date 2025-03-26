import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/docs";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  // Add your custom components here
  ComponentPreview,
};
