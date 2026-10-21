import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { RegistryStory } from "@/lib/registry-story";

import { Installation } from "./docs/installation";
import { TypeTable } from "./docs/type-table";

export const mdxComponents = {
  ...defaultMdxComponents,
  Installation,
  RegistryStory,
  Step,
  Steps,
  Tab,
  Tabs,
  TypeTable,
} satisfies MDXComponents;
