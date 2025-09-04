import React from "react";

import { cn } from "@notion-kit/cn";

export enum Tab {
  General = "general",
  Members = "members",
  Security = "security",
}

interface TitleProps {
  title: string;
}

export function Title({ title }: TitleProps) {
  return (
    <div className="mb-2.5 text-sm font-semibold text-primary">{title}</div>
  );
}

type CardProps = React.ComponentProps<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-sm border border-border px-4 py-1", className)}
      {...props}
    />
  );
}
