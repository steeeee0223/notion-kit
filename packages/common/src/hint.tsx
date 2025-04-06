import React from "react";

import type { TooltipContentProps } from "@notion-kit/shadcn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@notion-kit/shadcn";

interface HintProps extends TooltipContentProps {
  children: React.ReactNode;
  description: string;
}

const Hint: React.FC<HintProps> = ({
  children,
  description,
  side = "bottom",
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} {...props}>
        {description}
      </TooltipContent>
    </Tooltip>
  );
};

export { Hint, TooltipProvider as HintProvider };
