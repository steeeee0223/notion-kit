import { cn } from "@notion-kit/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
