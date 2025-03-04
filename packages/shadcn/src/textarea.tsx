import * as React from "react";

import { cn } from "@notion-kit/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted focus-visible:ring-ring dark:text-muted-dark flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};
Textarea.displayName = "Textarea";

export { Textarea };
