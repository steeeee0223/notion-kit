import * as React from "react";

import { cn } from "@notion-kit/cn";

import { inputVariants } from "./variants";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <div
      className={cn(
        inputVariants({ variant: "default", size: "lg" }),
        "min-h-20",
        className,
      )}
    >
      <textarea
        className="block h-full w-full resize-none border-none bg-transparent p-0 leading-6 text-inherit outline-hidden"
        {...props}
      />
    </div>
  );
}

export { Textarea };
