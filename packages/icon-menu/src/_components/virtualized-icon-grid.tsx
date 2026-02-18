import { useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { IconData } from "@notion-kit/icon-block";
import {
  Button,
  ScrollArea,
  TooltipPreset,
  TooltipProvider,
} from "@notion-kit/shadcn";

import type { IconFactoryResult, IconItem } from "../factories/types";
import { MenuSectionTitle } from "./menu-section-title";

const ICONS_PER_ROW = 12;
const HEADER_HEIGHT = 32;
const ROW_HEIGHT = 32;

type VirtualRow =
  | { type: "header"; id: string; label: string }
  | { type: "row"; id: string; iconIds: string[] };

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface VirtualizedIconGridProps {
  factory: IconFactoryResult;
  searchQuery: string;
  onSelect: (iconData: IconData) => void;
}

export function VirtualizedIconGrid({
  factory,
  searchQuery,
  onSelect,
}: VirtualizedIconGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Flatten sections into virtualizable rows: headers + icon rows
  const rows = useMemo((): VirtualRow[] => {
    if (searchQuery) {
      const ids = factory.search(searchQuery);
      return [
        {
          type: "header" as const,
          label: ids.length > 0 ? "Search Results" : "No results",
          id: "search",
        },
        ...chunk(ids, ICONS_PER_ROW).map((row, i) => ({
          type: "row" as const,
          id: `search-${i}`,
          iconIds: row,
        })),
      ];
    }
    return factory.sections
      .filter((section) => section.iconIds.length > 0)
      .flatMap((section) => [
        { type: "header" as const, label: section.label, id: section.id },
        ...chunk(section.iconIds, ICONS_PER_ROW).map((row, i) => ({
          type: "row" as const,
          id: `${section.id}-${i}`,
          iconIds: row,
        })),
      ]);
  }, [factory, searchQuery]);

  /**
   * ScrollArea from @notion-kit/shadcn wraps content inside a Radix Viewport div.
   * We need a ref to that viewport element for TanStack Virtual's getScrollElement.
   * We use a callback ref on the ScrollArea root to find the viewport child.
   */
  const scrollAreaRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const viewport = node.querySelector<HTMLDivElement>(
        '[data-slot="scroll-area-viewport"]',
      );
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current =
        viewport;
    }
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT,
    overscan: 5,
  });

  const handleIconClick = useCallback(
    (item: IconItem) => {
      const iconData = factory.toIconData(item, {});
      onSelect(iconData);
      factory.onSelect?.(item);
    },
    [factory, onSelect],
  );

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const index = rows.findIndex(
        (r) => r.type === "header" && r.id === sectionId,
      );
      if (index >= 0) {
        virtualizer.scrollToIndex(index, { align: "start" });
      }
    },
    [rows, virtualizer],
  );

  // Derive active section from first visible header at or above viewport top
  const virtualItems = virtualizer.getVirtualItems();
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const activeSectionId = useMemo(() => {
    if (virtualItems.length === 0) return null;

    // Find the last header whose start <= scrollOffset
    let lastHeader: string | null = null;
    for (const vItem of virtualItems) {
      const row = rows[vItem.index];
      if (row?.type === "header") {
        if (vItem.start <= scrollOffset + HEADER_HEIGHT) {
          lastHeader = row.id;
        }
      }
    }

    // If no header found in visible items, scan all rows before the first visible item
    if (!lastHeader && virtualItems[0]) {
      for (let i = virtualItems[0].index; i >= 0; i--) {
        const row = rows[i];
        if (row?.type === "header") {
          lastHeader = row.id;
          break;
        }
      }
    }

    return lastHeader;
  }, [rows, virtualItems, scrollOffset]);

  return (
    <TooltipProvider delayDuration={500}>
      <ScrollArea ref={scrollAreaRef} className="relative h-[214px] w-full">
        <div
          className="relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = rows[virtualRow.index]!;
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === "header" ? (
                  <MenuSectionTitle
                    title={item.label}
                    className="sticky -top-px z-1 bg-popover"
                  />
                ) : (
                  <div className="flex">
                    {item.iconIds.map((iconId) => {
                      const iconItem = factory.getItem(iconId);
                      return (
                        <TooltipPreset
                          key={iconId}
                          side="top"
                          description={iconItem.name}
                          className="z-1000"
                        >
                          <Button
                            variant="hint"
                            className="size-8 text-2xl/none"
                            onClick={() => handleIconClick(iconItem)}
                          >
                            {factory.renderIcon(iconItem, {})}
                          </Button>
                        </TooltipPreset>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {factory.navigation?.(scrollToSection, activeSectionId)}
    </TooltipProvider>
  );
}
