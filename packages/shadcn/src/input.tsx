"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";

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

function SearchIcon() {
  return (
    <svg
      role="graphics-symbol"
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="block size-3.5 shrink-0 grow-0 fill-default/45"
    >
      <path d="M.281 6.438c0-.875.164-1.696.492-2.461a6.484 6.484 0 011.375-2.032A6.237 6.237 0 016.64.078 6.2 6.2 0 019.11.57c.77.328 1.447.787 2.03 1.375a6.374 6.374 0 011.368 2.032c.333.765.5 1.586.5 2.46 0 .688-.107 1.342-.32 1.961a6.28 6.28 0 01-.868 1.696l3.563 3.578c.11.104.19.226.242.367.057.14.086.29.086.445 0 .22-.05.417-.149.594a1.122 1.122 0 01-1 .57c-.156 0-.307-.028-.453-.086a1.058 1.058 0 01-.382-.25l-3.586-3.585c-.5.333-1.047.596-1.641.789a6.089 6.089 0 01-1.86.28 6.237 6.237 0 01-2.468-.491 6.4 6.4 0 01-2.024-1.367A6.509 6.509 0 01.773 8.913a6.256 6.256 0 01-.492-2.476zm1.664 0c0 .65.12 1.26.36 1.828a4.775 4.775 0 001.015 1.5c.433.427.933.763 1.5 1.007a4.548 4.548 0 001.82.368c.652 0 1.261-.123 1.829-.368a4.747 4.747 0 002.508-2.507 4.567 4.567 0 00.367-1.829c0-.645-.123-1.252-.367-1.82a4.776 4.776 0 00-1.016-1.5A4.578 4.578 0 008.469 2.11a4.567 4.567 0 00-1.828-.367c-.646 0-1.253.123-1.82.367a4.667 4.667 0 00-1.5 1.008c-.433.432-.772.932-1.016 1.5a4.633 4.633 0 00-.36 1.82z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      role="graphics-symbol"
      viewBox="0 0 16 16"
      className="block size-4 shrink-0 fill-default/35 dark:fill-default/30"
    >
      <path d="M7.993 15.528a7.273 7.273 0 01-2.923-.593A7.633 7.633 0 012.653 13.3a7.797 7.797 0 01-1.633-2.417 7.273 7.273 0 01-.593-2.922c0-1.035.198-2.01.593-2.922A7.758 7.758 0 015.063.99 7.273 7.273 0 017.985.395a7.29 7.29 0 012.93.593 7.733 7.733 0 012.417 1.64 7.647 7.647 0 011.64 2.41c.396.914.594 1.888.594 2.923 0 1.035-.198 2.01-.593 2.922a7.735 7.735 0 01-4.058 4.05 7.272 7.272 0 01-2.922.594zM5.59 11.06c.2 0 .371-.066.513-.198L8 8.951l1.904 1.911a.675.675 0 00.498.198.667.667 0 00.491-.198.67.67 0 00.205-.49.64.64 0 00-.205-.491L8.981 7.969l1.92-1.911a.686.686 0 00.204-.491.646.646 0 00-.205-.484.646.646 0 00-.483-.205.67.67 0 00-.49.205L8 6.995 6.081 5.083a.696.696 0 00-.49-.19.682.682 0 00-.491.198.651.651 0 00-.198.49c0 .181.068.342.205.484l1.912 1.904-1.912 1.92a.646.646 0 00-.205.483c0 .19.066.354.198.49.136.132.3.198.49.198z" />
    </svg>
  );
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
          <SearchIcon />
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
          <ClearIcon />
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
