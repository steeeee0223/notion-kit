import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipDescription,
  TooltipProvider,
  TooltipTrigger,
} from "@notion-kit/ui/primitives";

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger render={<Button size="md">Basic</Button>} />
          <TooltipContent>
            <TooltipDescription text="Add to library" />
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button size="md">Details</Button>} />
          <TooltipContent>
            <TooltipDescription text="Open search" />
            <TooltipDescription type="secondary" text="⌘ K" />
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
