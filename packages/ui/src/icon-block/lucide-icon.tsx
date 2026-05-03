"use client";

import { Icon, type LucideProps } from "lucide-react";

import { createLucideNode } from "./lib/create-lucide-icon";
import type { IconData } from "./types";

interface LucideIconProps extends LucideProps {
  icon: Extract<IconData, { type: "lucide" }>;
}

export function LucideIcon({ icon, ...props }: LucideIconProps) {
  const iconNode = createLucideNode(icon.src);
  return (
    <Icon
      iconNode={iconNode}
      color={icon.color}
      aria-label={icon.src}
      {...props}
    />
  );
}
