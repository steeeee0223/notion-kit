"use client";

import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";
import { Avatar, AvatarFallback, AvatarImage } from "@notion-kit/shadcn";
import { Spinner } from "@notion-kit/spinner";

import { createLucideIcon, getLetter, isEmoji, isLucideIcon } from "./lib";
import type { IconData } from "./types";

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
export function IconBlock({ className, size, ...props }: IconBlockProps) {
  return (
    <Icon {...props} className={cn(iconBlockVariants({ size, className }))} />
  );
}

function Icon({
  className,
  icon,
  fallback = " ",
}: Omit<IconBlockProps, "size">) {
  if (icon.type === "url") {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-transparent">
          <Spinner className={className} />
        </AvatarFallback>
        <AvatarImage src={icon.src} alt="icon" />
      </Avatar>
    );
  }
  if (isLucideIcon(icon)) {
    return <LucideIcon className={className} icon={icon} />;
  }
  if (isEmoji(icon)) {
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

interface LucideIconProps {
  icon: Extract<IconData, { type: "lucide" }>;
  className?: string;
}

function LucideIcon({ icon, className }: LucideIconProps) {
  const renderIcon = useMemo(() => createLucideIcon(icon.src), [icon.src]);
  return renderIcon({ color: icon.color, className, "aria-label": icon.src });
}

interface LetterProps {
  className?: string;
  letter: string;
}

function Letter({ className, letter }: LetterProps) {
  return (
    <div className={cn("bg-default/10 text-center text-secondary", className)}>
      {letter}
    </div>
  );
}
