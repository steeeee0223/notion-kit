"use client";

import { useFilter } from "@notion-kit/hooks";
import { IconBlock } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import type { Page } from "@notion-kit/schemas";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  MenuItem,
  MenuItemAction,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import { AlertModal, SidebarMenuItem } from "../core";

interface TrashBoxProps {
  pages: Page[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (page: Page) => void;
}

export function TrashBox({
  isOpen,
  pages,
  onOpenChange,
  onRestore,
  onDelete,
  onSelect,
}: TrashBoxProps) {
  const { search, results, updateSearch } = useFilter(
    pages,
    (page, v) => page.title.toLowerCase().includes(v),
    { default: "all" },
  );
  /** Docs Actions */
  const handleSelect = (page: Page) => {
    onSelect?.(page);
    onOpenChange?.(false);
  };
  const handleRestore = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.stopPropagation();
    onRestore?.(id);
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <SidebarMenuItem
            label="Trash"
            icon={<Icon.Trash className="size-5.5" />}
            hint="Restore deleted pages"
          />
        </PopoverTrigger>
        <PopoverContent
          forceMount
          className="relative bottom-10 flex h-[50vh] w-[400px] flex-col"
          side="right"
          sideOffset={-4}
          align="start"
        >
          <div className="flex w-full items-center px-3 py-2.5">
            <Input
              clear
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              onCancel={() => updateSearch("")}
              placeholder="Search pages in Trash"
            />
          </div>
          <div className="flex h-full grow overflow-y-auto py-1.5">
            {!results || results.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center gap-2 text-secondary">
                <Icon.Trash className="block size-9 shrink-0 fill-current" />
                <div className="flex flex-col text-center text-sm">
                  <span className="font-semibold">No results</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex w-full flex-col px-1 pb-1 text-sm">
                {results.map((page) => (
                  <MenuItem
                    key={page.id}
                    id={page.id}
                    tabIndex={-1}
                    role="menuitem"
                    Icon={
                      <IconBlock
                        icon={page.icon ?? { type: "text", src: page.title }}
                      />
                    }
                    Body={page.title}
                    onClick={() => handleSelect(page)}
                  >
                    <MenuItemAction className="flex gap-1">
                      <TooltipPreset description="Restore">
                        <Button
                          variant="hint"
                          className="size-5"
                          onClick={(e) => handleRestore(e, page.id)}
                        >
                          <Icon.Undo className="size-4" />
                        </Button>
                      </TooltipPreset>
                      <Dialog>
                        <TooltipPreset description="Delete from Trash">
                          <DialogTrigger asChild>
                            <Button
                              variant="hint"
                              className="size-5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon.Trash className="size-4" />
                            </Button>
                          </DialogTrigger>
                        </TooltipPreset>
                        <AlertModal
                          title="Are you sure you want to delete this page from Trash?"
                          primary="Yes. Delete this page"
                          secondary="Cancel"
                          onTrigger={() => onDelete?.(page.id)}
                        />
                      </Dialog>
                    </MenuItemAction>
                  </MenuItem>
                ))}
              </div>
            )}
          </div>
          <footer className="mt-0.5 shrink-0 border-t bg-blue/5 px-2 py-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>
                Pages in Trash for over 30 days will be automatically deleted
              </span>
              <a
                href="https://www.notion.so/help/duplicate-delete-and-restore-content"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-0.5 no-underline select-none"
              >
                <Button variant="hint" className="size-5">
                  <Icon.QuestionMarkCircled className="size-3.5 shrink-0 fill-secondary" />
                </Button>
              </a>
            </div>
          </footer>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
