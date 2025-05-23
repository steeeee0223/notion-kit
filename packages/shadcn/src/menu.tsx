import React from "react";

import { cn } from "@notion-kit/cn";
import {
  groupVariants,
  menuItemVariants,
  type MenuItemVariants,
} from "@notion-kit/shadcn";

const MenuGroup = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div role="group" className={cn(groupVariants({ className }))} {...props} />
);

interface MenuItemProps extends React.ComponentProps<"div">, MenuItemVariants {
  Icon?: React.ReactNode;
  Body?: React.ReactNode;
}

const MenuItem = ({
  variant,
  disabled,
  className,
  Icon,
  Body,
  children,
  ...props
}: MenuItemProps) => (
  <div
    className={cn(menuItemVariants({ variant, disabled, className }))}
    {...props}
    data-disabled={disabled}
    aria-disabled={Boolean(disabled)}
  >
    <div className="peer mr-1 flex items-center justify-center empty:hidden">
      {Icon}
    </div>
    <div className="mx-1.5 min-w-0 flex-auto truncate peer-empty:mx-0">
      {Body}
    </div>
    {children}
  </div>
);

interface MenuItemActionProps extends React.PropsWithChildren {
  className?: string;
}

const MenuItemAction = ({ className, children }: MenuItemActionProps) => (
  <div className={cn("ml-auto min-w-0 shrink-0", className)}>{children}</div>
);

const MenuItemCheck = () => (
  <MenuItemAction className="w-3.5">
    <svg
      aria-hidden="true"
      role="graphics-symbol"
      viewBox="0 0 16 16"
      key="thinCheck"
      className="size-full fill-primary"
    >
      <path d="M6.385 14.162c.362 0 .642-.15.84-.444L13.652 3.71c.144-.226.205-.417.205-.602 0-.485-.341-.82-.833-.82-.335 0-.54.123-.746.444l-5.926 9.4-3.042-3.903c-.205-.267-.417-.376-.718-.376-.492 0-.848.348-.848.827 0 .212.075.417.253.629l3.541 4.416c.24.3.492.437.848.437z" />
    </svg>
  </MenuItemAction>
);

export { MenuGroup, MenuItem, MenuItemAction, MenuItemCheck };
