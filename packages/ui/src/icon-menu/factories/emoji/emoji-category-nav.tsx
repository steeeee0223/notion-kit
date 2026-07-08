import { cn } from "@notion-kit/cn";

import { Button, TooltipPreset } from "@/primitives";

import { CATEGORIES, type EmojiCategoryList } from "./constants";

interface EmojiCategoryNavProps {
  categories: EmojiCategoryList[];
  activeSectionId: string | null;
  scrollToSection: (sectionId: string) => void;
}

export function EmojiCategoryNav({
  categories,
  activeSectionId,
  scrollToSection,
}: EmojiCategoryNavProps) {
  return (
    <div className="flex items-center gap-0.5 border-t px-3 py-1">
      {categories.map((catId) => {
        const cat = CATEGORIES[catId];
        return (
          <TooltipPreset key={catId} description={cat.label}>
            <Button
              variant="hint"
              className={cn(
                "size-8",
                activeSectionId === catId && "bg-default/15",
              )}
              onClick={() => scrollToSection(catId)}
            >
              {cat.icon}
            </Button>
          </TooltipPreset>
        );
      })}
    </div>
  );
}
