import React, { createContext, use, useMemo, type ReactNode } from "react";

import { cn } from "@notion-kit/cn";
import { buttonVariants } from "@notion-kit/ui/primitives";

type CellTriggerProps = Omit<
  React.ComponentProps<"div">,
  "aria-disabled" | "aria-label" | "role"
> & {
  disabled?: boolean;
};

interface CellTriggerScopeValue {
  ariaLabel?: string;
  className?: string;
  stopPropagation: boolean;
}

const CellTriggerScopeContext = createContext<CellTriggerScopeValue>({
  stopPropagation: true,
});

interface CellTriggerScopeProps {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  stopPropagation?: boolean;
}

export function CellTriggerScope({
  ariaLabel,
  children,
  className,
  stopPropagation = true,
}: CellTriggerScopeProps) {
  const value = useMemo(
    () => ({ ariaLabel, className, stopPropagation }),
    [ariaLabel, className, stopPropagation],
  );

  return (
    <CellTriggerScopeContext value={value}>{children}</CellTriggerScopeContext>
  );
}

export function CellTrigger({
  children,
  className,
  disabled,
  onClick,
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onPointerDown,
  ref,
  tabIndex,
  ...props
}: CellTriggerProps) {
  const scope = use(CellTriggerScopeContext);

  return (
    <div
      {...props}
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      aria-disabled={disabled}
      aria-label={scope.ariaLabel}
      className={cn(
        buttonVariants({ variant: "cell" }),
        scope.className,
        className,
      )}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (scope.stopPropagation) event.stopPropagation();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (scope.stopPropagation) event.stopPropagation();
        onKeyDown?.(event);
        if (
          (event.key === "Enter" || event.key === " ") &&
          !event.defaultPrevented
        ) {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      onKeyUp={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onKeyUp?.(event);
      }}
      onMouseDown={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onMouseDown?.(event);
      }}
      onPointerDown={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onPointerDown?.(event);
      }}
    >
      {children}
    </div>
  );
}
