import React from "react";
import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { cn } from "@notion-kit/cn";

import { ComponentPreview, Installation } from "@/components/docs";

export const mdxComponents: MDXComponents = {
  ...defaultMdxComponents,
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <defaultMdxComponents.table
      className={cn("[&_tbody]:bg-main", className)}
      {...props}
    />
  ),
  Step,
  Steps,
  // Add your custom components here
  ComponentPreview,
  Installation,
};
