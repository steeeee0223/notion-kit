import { createElement, forwardRef } from "react";
import type { IconNode, LucideProps } from "lucide-react";
import { Icon } from "lucide-react";

import { cn } from "@notion-kit/cn";

import { iconNodes } from "./data";
import type { LucideName } from "./types";
import { toPascalCase } from "./utils";

/**
 * Create a Lucide icon component
 */
export const createLucideIcon = (name: LucideName) => {
  const nodeWithKeys = iconNodes[name].map(([elem, attrs], i) => [
    elem,
    { ...attrs, key: `${name}-${i}` },
  ]) as IconNode;
  const Component = forwardRef<SVGSVGElement, LucideProps>(
    ({ className, ...props }, ref) =>
      createElement(Icon, {
        ref,
        iconNode: nodeWithKeys,
        className: cn(`lucide-${name}`, className),
        ...props,
      }),
  );

  Component.displayName = toPascalCase(name);
  return Component;
};
