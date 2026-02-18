import {
  Bug,
  Car,
  Clock,
  Flag,
  Lightbulb,
  Smile,
  Star,
  Utensils,
} from "lucide-react";

import { cn } from "@notion-kit/cn";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";

import type { EmojiCategoryList } from "./constants";

const CATEGORY_ICONS: Record<
  EmojiCategoryList,
  { icon: React.ReactNode; label: string }
> = {
  frequent: { icon: <Clock size={16} />, label: "Recently used" },
  people: { icon: <Smile size={16} />, label: "Smileys & People" },
  nature: { icon: <Bug size={16} />, label: "Animals & Nature" },
  foods: { icon: <Utensils size={16} />, label: "Food & Drink" },
  activity: { icon: <Star size={16} />, label: "Activity" },
  places: { icon: <Car size={16} />, label: "Travel & Places" },
  objects: { icon: <Lightbulb size={16} />, label: "Objects" },
  symbols: {
    icon: <span className="text-sm font-medium">♫</span>,
    label: "Symbols",
  },
  flags: { icon: <Flag size={16} />, label: "Flags" },
  custom: {
    icon: <span className="text-sm font-medium">+</span>,
    label: "Custom",
  },
};

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
    <TooltipProvider delayDuration={300}>
      <div className="-mx-3 -mb-2 flex items-center gap-0.5 border-t px-3 py-1">
        {categories.map((catId) => {
          const cat = CATEGORY_ICONS[catId];
          return (
            <TooltipPreset
              key={catId}
              description={cat.label}
              side="top"
              className="z-1000"
            >
              <Button
                variant="hint"
                className={cn(
                  "size-8 text-icon",
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
    </TooltipProvider>
  );
}
