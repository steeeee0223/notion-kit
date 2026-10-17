import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@notion-kit/ui/primitives";

export function DetachExample() {
  const popoverHandle = Popover.createHandle<{ text: string }>();

  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <PopoverTrigger
          key={i}
          handle={popoverHandle}
          payload={{ text: `Trigger ${i + 1}` }}
          render={<Button size="sm">Trigger {i + 1}</Button>}
        />
      ))}
      <Popover handle={popoverHandle}>
        {({ payload }) => (
          <PopoverContent className="w-64 p-3 text-secondary">
            This has been opened by {payload?.text}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
