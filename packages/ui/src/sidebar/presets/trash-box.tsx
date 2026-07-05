import { Icon } from "@notion-kit/icons";
import type { Page } from "@notion-kit/schemas";

import { AlertModal } from "@/alert-modal";
import { IconBlock } from "@/icon-block";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  Button,
  Dialog,
  DialogTrigger,
  MenuItemAction,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
  TooltipProvider,
} from "@/primitives";
import { SidebarMenuItem } from "@/sidebar/core";

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
  const options = [{ value: "Archived", items: pages }];
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
        <PopoverTrigger
          nativeButton={false}
          render={
            <SidebarMenuItem
              label="Trash"
              icon={<Icon.Trash className="size-5.5" />}
              hint="Restore deleted pages"
            />
          }
        />
        <PopoverContent
          className="relative h-[50vh] w-100"
          side="right"
          sideOffset={-4}
          align="start"
        >
          <Autocomplete<Page>
            open
            items={options}
            itemToStringValue={(page) => page.title}
          >
            <AutocompleteInput
              search
              clear
              placeholder="Search pages in Trash"
            />
            <AutocompleteContent variant="inline" className="h-full">
              <AutocompleteEmpty className="size-full flex-col items-center justify-center gap-2">
                <Icon.Trash className="size-9 shrink-0 fill-current" />
                <span className="font-semibold">No results</span>
              </AutocompleteEmpty>
              <AutocompleteList>
                {(group: (typeof options)[number]) => (
                  <AutocompleteGroup key={group.value} items={group.items}>
                    <AutocompleteCollection>
                      {(page: Page) => (
                        <AutocompleteItem
                          key={page.id}
                          value={page}
                          icon={
                            <IconBlock
                              icon={
                                page.icon ?? { type: "text", src: page.title }
                              }
                            />
                          }
                          label={page.title}
                          onClick={() => handleSelect(page)}
                        >
                          <MenuItemAction className="flex items-center gap-1">
                            <TooltipPreset description="Restore">
                              <Button
                                variant="hint"
                                className="size-5"
                                aria-label="Restore"
                                onClick={(e) => handleRestore(e, page.id)}
                              >
                                <Icon.Undo className="size-4" />
                              </Button>
                            </TooltipPreset>
                            <Dialog>
                              <TooltipPreset description="Delete from Trash">
                                <DialogTrigger
                                  render={
                                    <Button
                                      variant="hint"
                                      className="size-5"
                                      aria-label="Delete from Trash"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Icon.Trash className="size-4" />
                                    </Button>
                                  }
                                />
                              </TooltipPreset>
                              <AlertModal
                                title="Are you sure you want to delete this page from Trash?"
                                primary="Yes. Delete this page"
                                secondary="Cancel"
                                onTrigger={() => onDelete?.(page.id)}
                              />
                            </Dialog>
                          </MenuItemAction>
                        </AutocompleteItem>
                      )}
                    </AutocompleteCollection>
                  </AutocompleteGroup>
                )}
              </AutocompleteList>
            </AutocompleteContent>
          </Autocomplete>
          <footer className="sticky bottom-0 z-10 mt-0.5 shrink-0 border-t bg-blue/5 px-2 py-1.5 shadow-sm">
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
                <Button variant="hint" className="size-5" aria-label="Help">
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
