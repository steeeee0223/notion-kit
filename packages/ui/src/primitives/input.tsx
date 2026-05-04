"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";

import { Button } from "./button";
import * as Icon from "./icons";
import type { InputVariants } from "./variants";
import { inputVariants } from "./variants";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: InputVariants["variant"];
  "data-size"?: InputVariants["size"];
  search?: boolean;
  clear?: boolean;
  endIcon?: React.ReactNode;
  onCancel?: () => void;
}

function Input({
  className,
  variant,
  search,
  clear,
  endIcon,
  "data-size": size,
  onCancel,
  ...props
}: InputProps) {
  const showClear =
    clear &&
    !props.disabled &&
    typeof props.value === "string" &&
    props.value.length > 0;
  return (
    <div className={cn(inputVariants({ variant, size, className }))}>
      {search && (
        <div className="mr-1.5">
          <Icon.Search />
        </div>
      )}
      <input
        className="block h-full resize-none border-none outline-hidden file:bg-inherit file:font-medium placeholder:text-default/45 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
        type={search ? "search" : props.type}
      />
      {showClear && (
        <Button
          type="button"
          variant="close"
          size="circle"
          className="ml-1 focus-visible:shadow-notion"
          aria-label="Clear input"
          onClick={onCancel}
        >
          <Icon.Clear />
        </Button>
      )}
      {endIcon && (
        <div className="ml-1" aria-hidden="true">
          {endIcon}
        </div>
      )}
    </div>
  );
}

export { Input };
