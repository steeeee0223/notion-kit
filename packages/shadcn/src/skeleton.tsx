import { cn } from "@notion-kit/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
