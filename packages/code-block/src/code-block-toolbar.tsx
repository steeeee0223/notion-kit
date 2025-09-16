import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, toast } from "@notion-kit/shadcn";

export function CodeBlockToolbar() {
  const { copy } = useCopyToClipboard({
    onSuccess: () => toast.success("Code copied to clipboard"),
  });

  return (
    <div
      className={cn(
        "absolute end-px top-[3px] z-10 flex h-[25px] items-center justify-end bg-popover",
        "opacity-0 transition-opacity group-hover/code-block:opacity-100 focus-within:opacity-100",
      )}
    >
      <div className="mt-1 mr-1 flex items-center justify-center text-primary">
        <Button
          tabIndex={0}
          variant={null}
          className="h-[25px] min-w-0 shrink-0 gap-1 rounded-e-none px-1.5 text-[11.5px]/[1.2]"
          onClick={() => copy("Hello world!")} // TODO: pass the actual code string here
        >
          <Icon.Copy className="size-4 fill-current" />
          Copy
        </Button>
        <Button
          tabIndex={0}
          variant={null}
          className="mx-px h-[25px] min-w-0 shrink-0 rounded-none px-1.5 text-[11.5px]/[1.2]"
        >
          Caption
        </Button>
        <Button
          tabIndex={0}
          variant={null}
          className="h-[25px] w-[26px] shrink-0 rounded-s-none px-1.5"
        >
          <Icon.EllipsisSmall className="size-4 fill-icon" />
        </Button>
      </div>
    </div>
  );
}
