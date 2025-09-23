"use client";

import { cn } from "@notion-kit/cn";
import { useFilter } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { useModal } from "@notion-kit/modal";
import type { Page } from "@notion-kit/schemas";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  Input,
} from "@notion-kit/shadcn";
import { toDateString } from "@notion-kit/utils";

interface SearchCommandProps {
  workspaceName: string;
  pages: Page[];
  onSelect?: (page: Page) => void;
  onOpenTrash?: () => void;
}

/**
 * @description Notion Search Command
 * @note Must be used within `ModalProvider`
 */
export function SearchCommand({
  workspaceName,
  pages,
  onSelect,
  onOpenTrash,
}: SearchCommandProps) {
  const { isOpen, closeModal } = useModal();
  const { search, results, updateSearch } = useFilter(pages, (page, v) =>
    page.title.toLowerCase().includes(v),
  );
  /** Search */
  const jumpToTrash = () => {
    closeModal();
    onOpenTrash?.();
  };
  const handleSelect = (page: Page) => {
    onSelect?.(page);
    closeModal();
  };

  return (
    <CommandDialog
      className="max-h-[max(50vh,570px)] min-h-[max(50vh,570px)] w-full max-w-[755px] rounded-[12px] bg-modal"
      open={isOpen}
      onOpenChange={closeModal}
      shouldFilter={false}
    >
      <div className="z-10 flex h-12 w-full shrink-0 grow-0 overflow-hidden border-b bg-transparent px-1">
        <Input
          search
          clear
          variant="flat"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          onCancel={() => updateSearch("")}
          placeholder={`Search in ${workspaceName}...`}
          className="h-full w-full min-w-0 px-3 text-lg/[27px]"
        />
      </div>
      <CommandList
        className={cn(
          "h-full min-h-0 grow transform",
          !results && "flex flex-col justify-center",
        )}
      >
        {results ? (
          <CommandGroup className="py-2" heading="Best matches">
            {results.map((page) => (
              <CommandItem
                key={page.id}
                value={`${page.title}-${page.id}`}
                title={page.title}
                onSelect={() => handleSelect(page)}
                className="group min-h-9"
              >
                <div className="mr-2.5 flex items-center justify-center">
                  <IconBlock
                    icon={page.icon ?? { type: "text", src: page.title }}
                    className="leading-[1.2]"
                  />
                </div>
                <div className="mr-1.5 min-w-0 flex-auto truncate">
                  {page.title}
                </div>
                <div className="flex h-3 flex-0 items-center text-xs text-muted">
                  <span className="truncate group-aria-selected:hidden">
                    {toDateString(page.lastEditedAt)}
                  </span>
                  <span className="hidden size-3 group-aria-selected:block">
                    <Icon.Enter className="shrink-0 fill-default/45" />
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          <CommandEmpty className="my-auto flex w-full items-center py-8 leading-[1.2] select-none">
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
        )}
      </CommandList>
      <CommandSeparator />
      <footer className="flex h-7 w-full shrink-0 grow-0 items-center truncate text-sm/[1.2] text-muted select-none">
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
