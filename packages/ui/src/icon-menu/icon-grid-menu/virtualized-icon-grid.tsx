import { useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import type { IconData } from "@/icon-block";
import type { IconFactoryResult, IconItem } from "@/icon-menu/factories";
import {
  AutocompleteGroup,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteRow,
  Button,
  ScrollArea,
  TooltipPreset,
  useAutocompleteFilteredItems,
} from "@/primitives";

const CONFIG = {
  iconsPerRow: 12,
  rowHeight: 32,
  initialRowCount: 12,
} as const;

interface IconSectionRows {
  id: string;
  label: string;
  startRowIndex: number;
}

interface VirtualLabelRow {
  id: string;
  type: "label";
  sectionId: string;
  label: string;
}

interface VirtualIconItemsRow {
  id: string;
  type: "items";
  sectionId: string;
  iconItems: IconItem[];
}

type VirtualIconRow = VirtualLabelRow | VirtualIconItemsRow;

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
  const filteredItems = useAutocompleteFilteredItems<IconItem>();

  const { sections, rows } = useMemo(() => {
    const groupedItems = new Map<string, IconItem[]>();

    for (const iconItem of filteredItems) {
      const sectionId = iconItem.sectionId ?? "all";
      const sectionItems = groupedItems.get(sectionId);
      if (sectionItems) {
        sectionItems.push(iconItem);
      } else {
        groupedItems.set(sectionId, [iconItem]);
      }
    }

    const nextSections: IconSectionRows[] = [];
    const nextRows: VirtualIconRow[] = [];

    for (const [sectionId, items] of groupedItems) {
      const rowChunks = chunk(items, CONFIG.iconsPerRow);
      nextSections.push({
        id: sectionId,
        label: items[0]?.sectionLabel ?? sectionId,
        startRowIndex: nextRows.length,
      });
      nextRows.push({
        id: `${sectionId}-label`,
        type: "label",
        sectionId,
        label: items[0]?.sectionLabel ?? sectionId,
      });

      for (const [i, iconItems] of rowChunks.entries()) {
        nextRows.push({
          id: `${sectionId}-${i}`,
          type: "items",
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
    estimateSize: () => CONFIG.rowHeight,
    getItemKey: (index) => rows[index]?.id ?? index,
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
      const iconData = factory.toIconData(item);
      onSelect?.(iconData);
      factory.select?.(item.id);
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
      : rows.slice(0, CONFIG.initialRowCount).map((row, index) => {
          const start = index * CONFIG.rowHeight;
          return {
            key: row.id,
            index,
            size: CONFIG.rowHeight,
            start,
            end: start + CONFIG.rowHeight,
            lane: 0,
          };
        });
  const totalSize = Math.max(
    virtualizer.getTotalSize(),
    rows.length * CONFIG.rowHeight,
  );
  const scrollOffset = virtualizer.scrollOffset ?? 0;
  const activeSectionId = useMemo(() => {
    if (rows.length === 0) return null;

    const activeRowIndex = Math.min(
      rows.length - 1,
      Math.max(0, Math.floor(scrollOffset / CONFIG.rowHeight)),
    );
    return rows[activeRowIndex]?.sectionId ?? sections[0]?.id ?? null;
  }, [rows, sections, scrollOffset]);
  return (
    <AutocompleteList>
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
                {item.type === "label" ? (
                  <AutocompleteLabel
                    title={item.label}
                    className="my-0 h-8 bg-popover"
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
                          description={iconItem.name}
                        >
                          <AutocompleteItem
                            value={iconItem}
                            index={filteredIndex}
                            onClick={() => handleIconClick(iconItem)}
                            nativeButton
                            render={
                              <Button
                                variant="hint"
                                className="size-8 text-2xl/none data-highlighted:bg-default/10"
                              >
                                {factory.renderIcon(iconItem)}
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
      {factory.renderNavigation?.(scrollToSection, activeSectionId)}
    </AutocompleteList>
  );
}
