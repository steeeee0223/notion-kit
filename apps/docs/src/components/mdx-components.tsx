import type { MDXComponents } from "mdx/types";
import {
  ComponentPreview,
  ComponentPreviewProps,
} from "@/components/docs/component-preview";
import defaultMdxComponents from "fumadocs-ui/mdx";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  // Add your custom components here
  ComponentPreview: (props: ComponentPreviewProps) => (
    <ComponentPreview containerClassName="not-first:mt-4" {...props} />
  ),
};
