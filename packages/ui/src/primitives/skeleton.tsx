import { cn } from "@notion-kit/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-default/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
