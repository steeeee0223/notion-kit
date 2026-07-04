import { Icon } from "lucide-react";
import type { IconNode, LucideProps } from "lucide-react";

import { iconNodes } from "./lib/data";
import type { IconData, LucideName } from "./types";

/**
 * Creates a Lucide icon nodes
 */
function createLucideNode(name: LucideName) {
  return iconNodes[name].map(([elem, attrs], i) => [
    elem,
    { ...attrs, key: `${name}-${i}` },
  ]) as IconNode;
}

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
