import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/docs";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  Step,
  Steps,
  // Add your custom components here
  ComponentPreview,
};
