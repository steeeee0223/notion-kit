"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { Button, TooltipPreset, TooltipProvider } from "@notion-kit/shadcn";

import { CirclePlus, emojiCategoryIcons } from "./emoji-icons";
import type { EmojiCategoryList, UseEmojiPickerType } from "./types";

export type EmojiPickerNavigationProps = {
  onClick: (id: EmojiCategoryList) => void;
} & Pick<UseEmojiPickerType, "emojiLibrary" | "focusedCategory" | "i18n">;

export const EmojiPickerNavigation: React.FC<EmojiPickerNavigationProps> = ({
  emojiLibrary,
  focusedCategory,
  i18n,
  onClick,
}) => {
  return (
    <TooltipProvider delayDuration={500}>
      <nav
        id="emoji-nav"
        className="-mx-3 h-12 border-t bg-transparent px-3 py-2"
      >
        <div className="relative flex items-center justify-between">
          {emojiLibrary
            .getGrid()
            .sections()
            .map(({ id }) => (
              <TooltipPreset
                key={id}
                align="start"
                description={i18n.categories[id]}
              >
                <Button
                  variant="hint"
                  className={cn(
                    "size-8 p-0",
                    id === focusedCategory && "bg-default/5",
                  )}
                  onClick={() => onClick(id)}
                  aria-label={i18n.categories[id]}
                >
                  <span className="inline-flex size-5 items-center justify-center text-[#91918e] dark:text-default/45">
                    {emojiCategoryIcons[id]}
                  </span>
                </Button>
              </TooltipPreset>
            ))}
          <TooltipPreset align="start" description="Add emoji">
            <Button variant="hint" className="size-8 p-0" aria-label="add">
              <span className="inline-flex size-5 items-center justify-center">
                <CirclePlus className="block size-7 flex-shrink-0 scale-110 fill-[#91918e] dark:fill-default/45" />
              </span>
            </Button>
          </TooltipPreset>
        </div>
      </nav>
    </TooltipProvider>
  );
};
