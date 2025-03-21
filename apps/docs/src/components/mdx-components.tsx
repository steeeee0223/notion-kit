import type { MDXComponents } from "mdx/types";
import { ComponentPreview } from "@/components/docs";
import defaultMdxComponents from "fumadocs-ui/mdx";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  // Add your custom components here
  ComponentPreview,
};
