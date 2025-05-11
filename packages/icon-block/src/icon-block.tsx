"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { createLucideIcon, getLetter, isEmoji, isLucideIcon } from "./lib";
import type { IconData, LucideName } from "./types";

const iconBlockVariants = cva("shrink-0 select-none", {
  variants: {
    size: {
      sm: "size-5 rounded-sm p-0.5 text-sm/4",
      md: "size-9 rounded-md p-1 text-3xl/8",
      lg: "size-16 rounded-md p-1 text-5xl/tight",
      xl: "size-[78px] rounded-lg p-1 text-7xl",
    },
  },
  defaultVariants: { size: "sm" },
});

export interface IconBlockProps extends VariantProps<typeof iconBlockVariants> {
  className?: string;
  icon: IconData;
  fallback?: string;
}

/**
 * A block for icon display.
 */
export const IconBlock: React.FC<IconBlockProps> = ({
  className,
  size,
  ...props
}) => {
  return (
    <Icon {...props} className={cn(iconBlockVariants({ size, className }))} />
  );
};

const Icon: React.FC<Omit<IconBlockProps, "size">> = ({
  className,
  icon,
  fallback = " ",
}) => {
  switch (icon.type) {
    case "lucide": {
      const isLucide = isLucideIcon(icon.src);
      if (isLucide) {
        const Icon = createLucideIcon(icon.src as LucideName);
        return (
          <Icon
            color={icon.color}
            className={className}
            aria-label={icon.src}
          />
        );
      }
      return (
        <Letter className={className} letter={getLetter(icon.src, fallback)} />
      );
    }
    case "url":
      return (
        <Avatar className={className}>
          <AvatarFallback className="bg-transparent">
            <Spinner className={className} />
          </AvatarFallback>
          <AvatarImage src={icon.src} alt="icon" />
        </Avatar>
      );
    default: {
      if (icon.type === "emoji" && isEmoji(icon.src)) {
        return (
          <div className={cn("text-center text-primary", className)}>
            {icon.src}
          </div>
        );
      }
      return (
        <Letter className={className} letter={getLetter(icon.src, fallback)} />
      );
    }
  }
};

interface LetterProps {
  className?: string;
  letter: string;
}

const Letter: React.FC<LetterProps> = ({ className, letter }) => (
  <div className={cn("bg-default/10 text-center text-secondary", className)}>
    {letter}
  </div>
);
