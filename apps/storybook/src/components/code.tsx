import { cn } from "@notion-kit/cn";
import { typography } from "@notion-kit/ui/primitives";

interface CodeProps {
  className?: string;
  title?: string;
  codeObject: unknown;
}

export function Code({ className, title, codeObject }: CodeProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {title && <h3 className={cn(typography("h3"))}>{title}</h3>}
      <code className="w-full rounded-md bg-input p-2">
        <pre className="text-xs">{JSON.stringify(codeObject, null, 2)}</pre>
      </code>
    </div>
  );
}
