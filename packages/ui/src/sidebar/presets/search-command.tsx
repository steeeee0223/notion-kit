import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import type { Page } from "@notion-kit/schemas";
import { toDateString } from "@notion-kit/utils";

import { IconBlock } from "@/icon-block";
import {
  CommandCollection,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  MenuItemAction,
} from "@/primitives";

interface SearchCommandProps {
  workspaceName: string;
  pages: Page[];
  open?: boolean;
  onSelect?: (page: Page) => void;
  onOpenChange?: (open: boolean) => void;
  onOpenTrash?: () => void;
}

/**
 * @description Notion Search Command
 */
export function SearchCommand({
  workspaceName,
  pages,
  open,
  onOpenChange,
  onSelect,
  onOpenTrash,
}: SearchCommandProps) {
  /** Search */
  const jumpToTrash = () => {
    onOpenChange?.(false);
    onOpenTrash?.();
  };
  const handleSelect = (page: Page) => {
    onSelect?.(page);
    onOpenChange?.(false);
  };

  return (
    <CommandDialog
      className="max-h-[max(50vh,570px)] min-h-[max(50vh,570px)] w-full max-w-[755px] rounded-[12px]"
      open={open}
      onOpenChange={onOpenChange}
      items={pages}
      itemToStringValue={(page) => page.title}
    >
      <CommandInput
        search
        clear
        variant="flat"
        placeholder={`Search in ${workspaceName}...`}
        classNames={{
          wrapper:
            "z-10 h-12 w-full shrink-0 grow-0 overflow-hidden border-b bg-transparent px-1 py-0",
        }}
        className="size-full min-w-0 px-3 text-lg/[27px]"
      />
      <CommandList className={cn("h-full min-h-0 grow transform")}>
        <CommandGroup className="py-2" heading="Best matches">
          <CommandCollection>
            {(page: Page) => (
              <CommandItem
                key={page.id}
                value={page}
                label={page.title}
                icon={
                  <IconBlock
                    icon={page.icon ?? { type: "text", src: page.title }}
                    className="leading-tight"
                  />
                }
                onClick={() => handleSelect(page)}
                className="group min-h-9"
              >
                <MenuItemAction className="flex h-3 flex-0 items-center text-xs text-muted">
                  <span className="truncate group-data-highlighted:hidden">
                    {toDateString(page.lastEditedAt)}
                  </span>
                  <span className="hidden size-3 group-data-highlighted:block">
                    <Icon.Enter className="shrink-0 fill-default/45" />
                  </span>
                </MenuItemAction>
              </CommandItem>
            )}
          </CommandCollection>
        </CommandGroup>
        <CommandEmpty className="my-auto flex w-full items-center py-8 leading-tight select-none">
          <div className="mx-3 min-w-0 flex-auto">
            <div className="truncate">
              <div role="alert" className="m-0 font-medium text-secondary">
                No results
              </div>
            </div>
            <div className="overflow-hidden text-sm text-ellipsis whitespace-normal">
              <div className="text-muted">
                Some results may be in your deleted pages.
                <br />
                <button
                  onClick={jumpToTrash}
                  className="inline cursor-pointer leading-6 text-blue select-none"
                >
                  Search deleted pages
                </button>
              </div>
            </div>
          </div>
        </CommandEmpty>
      </CommandList>
      <CommandSeparator />
      <footer className="flex h-7 w-full shrink-0 grow-0 items-center truncate text-sm/tight text-muted select-none">
        <div className="mx-3 min-w-0 flex-auto">
          <ul className="m-0 inline-flex list-none items-center gap-5 truncate p-0">
            <li className="flex h-max items-center gap-1.5">
              <Icon.ArrowUpDown className="inline size-3 shrink-0 fill-secondary" />
              Select
            </li>
            <li className="flex h-max items-center gap-1.5">
              <Icon.Enter className="inline size-3 shrink-0 fill-secondary" />
              Open
            </li>
          </ul>
        </div>
      </footer>
    </CommandDialog>
  );
}
