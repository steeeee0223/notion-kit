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

interface IconSectionRows {
  id: string;
  label: string;
  startRowIndex: number;
}

interface VirtualIconRow {
  id: string;
  sectionId: string;
  iconItems: IconAutocompleteItem[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
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

  const { sections, rows } = useMemo(() => {
    const groupedItems = new Map<string, IconAutocompleteItem[]>();

    for (const iconItem of filteredItems) {
      const sectionItems = groupedItems.get(iconItem.sectionId);
      if (sectionItems) {
        sectionItems.push(iconItem);
      } else {
        groupedItems.set(iconItem.sectionId, [iconItem]);
      }
    }

    const nextSections: IconSectionRows[] = [];
    const nextRows: VirtualIconRow[] = [];

    for (const [sectionId, items] of groupedItems) {
      const rowChunks = chunk(items, ICONS_PER_ROW);
      nextSections.push({
        id: sectionId,
        label: items[0]?.sectionLabel ?? sectionId,
        startRowIndex: nextRows.length,
      });

      for (const [i, iconItems] of rowChunks.entries()) {
        nextRows.push({
          id: `${sectionId}-${i}`,
          sectionId,
          iconItems,
        });
      }
    }

    return { sections: nextSections, rows: nextRows };
  }, [filteredItems]);

  const filteredIndexByItem = useMemo(
    () => new Map(filteredItems.map((item, index) => [item, index])),
    [filteredItems],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => rows[index]?.id ?? index,
    initialRect: { width: 400, height: 214 },
    overscan: 5,
    paddingStart: HEADER_HEIGHT,
    scrollPaddingStart: HEADER_HEIGHT,
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
      const section = sections.find((s) => s.id === sectionId);
      if (section) {
        virtualizer.scrollToIndex(section.startRowIndex, { align: "start" });
      }
    },
    [sections, virtualizer],
  );

  const virtualItems = virtualizer.getVirtualItems();
  const renderedVirtualRows =
    virtualItems.length > 0
      ? virtualItems
      : rows.slice(0, INITIAL_ROW_COUNT).map((row, index) => {
          const start = HEADER_HEIGHT + index * ROW_HEIGHT;
          return {
            key: row.id,
            index,
            size: ROW_HEIGHT,
            start,
            end: start + ROW_HEIGHT,
            lane: 0,
          };
        });
  const totalSize = Math.max(
    virtualizer.getTotalSize(),
    HEADER_HEIGHT + rows.length * ROW_HEIGHT,
  );
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const activeSectionId = useMemo(() => {
    if (rows.length === 0) return null;

    const activeRowIndex = Math.min(
      rows.length - 1,
      Math.max(0, Math.floor(scrollOffset / ROW_HEIGHT)),
    );
    return rows[activeRowIndex]?.sectionId ?? sections[0]?.id ?? null;
  }, [rows, sections, scrollOffset]);
  const activeSection = useMemo(
    () =>
      sections.find((section) => section.id === activeSectionId) ??
      sections[0] ??
      null,
    [sections, activeSectionId],
  );

  return (
    <>
      <ScrollArea ref={scrollAreaRef} className="relative h-[214px] w-full">
        <div className="relative" style={{ height: totalSize }}>
          {activeSection ? (
            <AutocompleteGroup
              className="sticky top-0 z-1 bg-popover"
              style={{ height: HEADER_HEIGHT, overflow: "visible" }}
            >
              <AutocompleteLabel
                title={activeSection.label}
                className="sticky top-0 z-1 my-0 h-8 bg-popover px-0"
              />
            </AutocompleteGroup>
          ) : null}
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
              </AutocompleteGroup>
            );
          })}
        </div>
      </ScrollArea>
      {factory.navigation?.(scrollToSection, activeSectionId)}
    </>
  );
}
