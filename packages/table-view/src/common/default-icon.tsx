import React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

interface DefaultIconProps {
  type: string;
  className?: string;
}

export function DefaultIcon({ type, className }: DefaultIconProps) {
  const iconClassName = cn("block size-4 shrink-0", className);
  switch (type) {
    case "title":
      return <Icon.TypesTitle className={iconClassName} />;
    case "text":
      return <Icon.TypesText className={iconClassName} />;
    case "checkbox":
      return <Icon.TypesCheckbox className={iconClassName} />;
    case "select":
      return <Icon.TypesSelect className={iconClassName} />;
    case "multi-select":
      return <Icon.TypesMultiSelect className={iconClassName} />;
    case "number":
      return <Icon.HashTag className={iconClassName} />;
    default:
      return <div className={iconClassName} />;
  }
}

interface ColorIconProps {
  color: string;
}

export function ColorIcon({ color }: ColorIconProps) {
  return (
    <div
      className="block size-[18px] shrink-0 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}
