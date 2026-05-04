import { createElement, forwardRef } from "react";
import type { IconNode, LucideProps } from "lucide-react";
import { Icon } from "lucide-react";

import { cn } from "@notion-kit/cn";

import type { LucideName } from "../types";
import { iconNodes } from "./data";
import { toPascalCase } from "./utils";

/**
 * Create a Lucide icon nodes
 */
export function createLucideNode(name: LucideName) {
  return iconNodes[name].map(([elem, attrs], i) => [
    elem,
    { ...attrs, key: `${name}-${i}` },
  ]) as IconNode;
}

/**
 * Create a Lucide icon component
 */
export function createLucideIcon(name: LucideName) {
  const iconNode = createLucideNode(name);
  const Component = forwardRef<SVGSVGElement, LucideProps>(
    ({ className, ...props }, ref) =>
      createElement(Icon, {
        ref,
        iconNode,
        className: cn(`lucide-${name}`, className),
        ...props,
      }),
  );

  Component.displayName = toPascalCase(name);
  return Component;
}
