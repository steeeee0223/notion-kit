import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { Installation } from "./docs/installation";

export const mdxComponents = {
  ...defaultMdxComponents,
  Installation,
  Step,
  Steps,
  Tab,
  Tabs,
  TypeTable,
} satisfies MDXComponents;
