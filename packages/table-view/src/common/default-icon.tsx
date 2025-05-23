import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { PropertyType } from "../lib/types";

interface DefaultIconProps {
  type: PropertyType;
  className?: string;
}

export const DefaultIcon: React.FC<DefaultIconProps> = ({
  type,
  className,
}) => {
  const iconClassName = cn("block size-4 shrink-0", className);
  switch (type) {
    case "title":
      return <Icon.TypesTitle className={iconClassName} />;
    case "text":
      return <Icon.TypesText className={iconClassName} />;
    case "checkbox":
      return <Icon.TypesCheckbox className={iconClassName} />;
    case "select":
    default:
      return <div className={iconClassName} />;
  }
};
