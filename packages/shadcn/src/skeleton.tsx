import { cn } from "@notion-kit/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-primary/10 animate-pulse rounded-sm", className)}
      {...props}
    />
  );
}

export { Skeleton };
