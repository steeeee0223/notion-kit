import { useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { IconData } from "@/icon-block";
import type { IconFactoryResult, IconItem } from "@/icon-menu/factories";
import {
  AutocompleteGroup,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteRow,
  Button,
  ScrollArea,
  TooltipPreset,
  useAutocompleteFilteredItems,
} from "@/primitives";

import type { IconAutocompleteItem } from "./types";

const ICONS_PER_ROW = 12;
const HEADER_HEIGHT = 32;
const ROW_HEIGHT = 32;
const INITIAL_ROW_COUNT = 12;

type VirtualRow =
  | { type: "header"; id: string; label: string }
  | { type: "row"; id: string; iconItems: IconAutocompleteItem[] };

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function getRowHeight(row: VirtualRow | undefined) {
  return row?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT;
}

function getTotalRowsHeight(rows: VirtualRow[]) {
  return rows.reduce((height, row) => height + getRowHeight(row), 0);
}

interface VirtualizedIconGridProps {
  factory: IconFactoryResult;
  onSelect?: (iconData: IconData) => void;
}

export function VirtualizedIconGrid({
  factory,
  onSelect,
}: VirtualizedIconGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const filteredItems = useAutocompleteFilteredItems<IconAutocompleteItem>();

  // Flatten sections into virtualizable rows: headers + icon rows
  const rows = useMemo((): VirtualRow[] => {
    const groupedItems = new Map<string, IconAutocompleteItem[]>();

    for (const iconItem of filteredItems) {
      const sectionItems = groupedItems.get(iconItem.sectionId);
      if (sectionItems) {
        sectionItems.push(iconItem);
      } else {
        groupedItems.set(iconItem.sectionId, [iconItem]);
      }
    }

    return Array.from(groupedItems.entries()).flatMap(([sectionId, items]) => [
      {
        type: "header" as const,
        label: items[0]?.sectionLabel ?? sectionId,
        id: sectionId,
      },
      ...chunk(items, ICONS_PER_ROW).map((row, i) => ({
        type: "row" as const,
        id: `${sectionId}-${i}`,
        iconItems: row,
      })),
    ]);
  }, [filteredItems]);

  const filteredIndexByItem = useMemo(
    () => new Map(filteredItems.map((item, index) => [item, index])),
    [filteredItems],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT,
    initialRect: { width: 400, height: 214 },
    overscan: 5,
  });

  /**
   * ScrollArea from @/primitives wraps content inside a Radix Viewport div.
   * We need a ref to that viewport element for TanStack Virtual's getScrollElement.
   * We use a callback ref on the ScrollArea root to find the viewport child.
   */
  const scrollAreaRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const viewport = node.querySelector<HTMLDivElement>(
        '[data-slot="scroll-area-viewport"]',
      );
      scrollRef.current = viewport;
    }
  }, []);

  const handleIconClick = useCallback(
    (item: IconItem) => {
      const iconData = factory.toIconData(item, {});
      onSelect?.(iconData);
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
  const renderedVirtualRows =
    virtualItems.length > 0
      ? virtualItems
      : rows.slice(0, INITIAL_ROW_COUNT).map((row, index) => {
          const start = getTotalRowsHeight(rows.slice(0, index));
          const size = getRowHeight(row);
          return {
            key: row.id,
            index,
            size,
            start,
            end: start + size,
            lane: 0,
          };
        });
  const totalSize = Math.max(
    virtualizer.getTotalSize(),
    getTotalRowsHeight(rows),
  );
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const activeSectionId = useMemo(() => {
    if (renderedVirtualRows.length === 0) return null;

    // Find the last header whose start <= scrollOffset
    let lastHeader: string | null = null;
    for (const vItem of renderedVirtualRows) {
      const row = rows[vItem.index];
      if (row?.type === "header") {
        if (vItem.start <= scrollOffset + HEADER_HEIGHT) {
          lastHeader = row.id;
        }
      }
    }

    // If no header found in visible items, scan all rows before the first visible item
    if (!lastHeader && renderedVirtualRows[0]) {
      for (let i = renderedVirtualRows[0].index; i >= 0; i--) {
        const row = rows[i];
        if (row?.type === "header") {
          lastHeader = row.id;
          break;
        }
      }
    }

    return lastHeader;
  }, [rows, renderedVirtualRows, scrollOffset]);

  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="relative h-[214px] w-full">
        <div className="relative" style={{ height: totalSize }}>
          {renderedVirtualRows.map((virtualRow) => {
            const item = rows[virtualRow.index]!;
            return (
              <AutocompleteGroup
                key={item.id}
                render={
                  <div
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                }
              >
                {item.type === "header" ? (
                  <AutocompleteLabel
                    title={item.label}
                    className="sticky -top-px z-1 bg-popover px-0"
                  />
                ) : (
                  <AutocompleteRow>
                    {item.iconItems.map((iconItem) => {
                      const filteredIndex =
                        filteredIndexByItem.get(iconItem) ?? -1;
                      return (
                        <TooltipPreset
                          key={iconItem.id}
                          side="top"
                          description={iconItem.item.name}
                        >
                          <AutocompleteItem
                            value={iconItem}
                            index={filteredIndex}
                            onClick={() => handleIconClick(iconItem.item)}
                            render={
                              <Button
                                variant="hint"
                                className="size-8 text-2xl/none data-highlighted:bg-default/10"
                              >
                                {factory.renderIcon(iconItem.item, {})}
                              </Button>
                            }
                          />
                        </TooltipPreset>
                      );
                    })}
                  </AutocompleteRow>
                )}
              </AutocompleteGroup>
            );
          })}
        </div>
      </ScrollArea>
      {factory.navigation?.(scrollToSection, activeSectionId)}
    </>
  );
}
