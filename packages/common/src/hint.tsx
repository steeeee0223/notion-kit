import React from "react";

import type { TooltipContentProps } from "@notion-kit/shadcn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@notion-kit/shadcn";

export interface Description {
  type: "default" | "secondary";
  text: string;
}

export interface HintProps extends TooltipContentProps {
  children: React.ReactNode;
  description: string | Description[];
  disabled?: boolean;
}

const Hint: React.FC<HintProps> = ({
  children,
  description,
  disabled,
  side = "bottom",
  ...props
}) => {
  const body =
    typeof description === "string"
      ? description
      : description.map((desc, i) => <HintDescription key={i} {...desc} />);

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {!disabled && (
        <TooltipContent side={side} {...props}>
          {body}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const HintDescription: React.FC<Description> = ({ type, text }) => {
  switch (type) {
    case "secondary":
      return <span className="text-tooltip-secondary">{text}</span>;
    default:
      return <div>{text}</div>;
  }
};

export { Hint, TooltipProvider as HintProvider };
