import React from "react";

import { DefaultIcon } from "../common";
import type { PluginType } from "../lib/types";
import { CellPlugin } from "../plugins";

interface MenuOption {
  type: PluginType<CellPlugin[]>;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const propertyTypes: Partial<
  Record<PluginType<CellPlugin[]>, MenuOption>
> = {
  title: {
    type: "title",
    title: "Title",
    description: "",
    icon: <DefaultIcon type="title" className="fill-menu-icon" />,
  },
  text: {
    type: "text",
    title: "Text",
    description:
      "Add text that can be formatted. Great for summaries, notes, or descriptions.",
    icon: <DefaultIcon type="text" className="fill-menu-icon" />,
  },
  checkbox: {
    type: "checkbox",
    title: "Checkbox",
    description:
      "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
    icon: <DefaultIcon type="checkbox" className="fill-menu-icon" />,
  },
  select: {
    type: "select",
    title: "Select",
    description:
      "Use a select property to choose one option from a predefined list. Great for categorization.",
    icon: <DefaultIcon type="select" className="fill-menu-icon" />,
  },
  "multi-select": {
    type: "multi-select",
    title: "Multi-select",
    description:
      "Use a multi-select property to choose multiple options from a predefined list. Useful for tagging or categorization.",
    icon: <DefaultIcon type="multi-select" className="fill-menu-icon" />,
  },
} as const;

export const propOptions = Object.values(propertyTypes) as MenuOption[];
