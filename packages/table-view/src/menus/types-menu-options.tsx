import React from "react";

import { DefaultIcon } from "../common";
import type { PropertyType } from "../lib/types";

interface MenuOption {
  type: PropertyType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const propertyTypes: Partial<Record<PropertyType, MenuOption>> = {
  title: {
    type: "title",
    title: "Title",
    description: "",
    icon: <DefaultIcon type="title" className="fill-icon" />,
  },
  text: {
    type: "text",
    title: "Text",
    description:
      "Add text that can be formatted. Great for summaries, notes, or descriptions.",
    icon: <DefaultIcon type="text" className="fill-icon" />,
  },
  checkbox: {
    type: "checkbox",
    title: "Checkbox",
    description:
      "Use a checkbox to indicate whether a condition is true or false. Useful for lightweight task tracking.",
    icon: <DefaultIcon type="checkbox" className="fill-icon" />,
  },
} as const;

export const propOptions = Object.values(propertyTypes);
