import React from "react";

import { cn } from "@notion-kit/cn";

interface MenuSectionTitleProps {
  className?: string;
  title: string;
}

export const MenuSectionTitle: React.FC<MenuSectionTitleProps> = ({
  className,
  title,
}) => (
  <div
    className={cn(
      "truncate py-2 text-xs/[1.2] font-medium text-secondary",
      className,
    )}
  >
    {title}
  </div>
);
