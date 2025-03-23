import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";

import { contentVariants, ContentVariants } from "./variants";

const cardVariants = cva("rounded-lg shadow-xs", {
  variants: {
    asButton: {
      true: "hover:bg-primary/5 cursor-pointer select-none",
    },
  },
  defaultVariants: { asButton: false },
});

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants>,
    ContentVariants {}

const Card = ({
  className,
  variant = "default",
  asButton,
  ...props
}: CardProps) => (
  <div
    className={cn(
      contentVariants({ variant }),
      cardVariants({ asButton }),
      className,
    )}
    role={asButton ? "button" : undefined}
    tabIndex={asButton ? 0 : undefined}
    {...props}
  />
);
Card.displayName = "Card";

const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({
  className,
  children,
  ...props
}: React.ComponentProps<"h3">) => (
  <h3
    className={cn(
      "text-2xl leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p
    className={cn("text-muted dark:text-muted-dark text-sm", className)}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("p-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
