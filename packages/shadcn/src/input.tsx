"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";

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
        className="block resize-none border-none outline-hidden file:bg-inherit file:font-medium placeholder:text-default/45 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
        type={search ? "search" : props.type}
      />
      {showClear && (
        <button
          type="button"
          className="ml-1 shrink-0 grow-0 animate-bg-in cursor-pointer rounded-full outline-none select-none hover:bg-default/5 focus-visible:shadow-notion"
          aria-label="Clear input"
          onClick={onCancel}
        >
          <Icon.Clear />
        </button>
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
