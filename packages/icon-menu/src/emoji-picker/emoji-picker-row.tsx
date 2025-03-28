"use client";

import React, { memo } from "react";
import { Emoji } from "@emoji-mart/data";

import { Hint } from "@notion-kit/common";
import { Button } from "@notion-kit/shadcn";

import type { GridRow } from "../lib";
import type { Skin, UseEmojiPickerType } from "./types";
import { getNativeEmoji } from "./utils";

interface EmojiButtonProps {
  emoji: Emoji;
  skin: Skin;
  index: number;
  onSelect: (emoji: Emoji) => void;
}

export const EmojiButton: React.FC<EmojiButtonProps> = memo(
  ({ emoji, skin, index, onSelect }) => (
    <Hint align="center" side="top" description={emoji.name}>
      <Button
        variant="hint"
        className="size-8 p-0 text-2xl/none"
        onClick={() => onSelect(emoji)}
        aria-label={emoji.name}
        data-index={index}
        tabIndex={-1}
      >
        <span
          className="relative text-primary dark:text-primary/80"
          style={{
            fontFamily:
              '"Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols',
          }}
          data-emoji-set="native"
        >
          {getNativeEmoji(emoji, skin)}
        </span>
      </Button>
    </Hint>
  ),
);
EmojiButton.displayName = "EmojiButton";

type EmojiPickerRow = {
  row: GridRow;
} & Pick<UseEmojiPickerType, "emojiLibrary" | "skin" | "onSelectEmoji">;

export const EmojiPickerRow: React.FC<EmojiPickerRow> = memo(
  ({ emojiLibrary, row, skin, onSelectEmoji }) => (
    <div key={row.id} className="flex" data-index={row.id}>
      {row.elements.map((emojiId, index) => (
        <EmojiButton
          key={emojiId}
          emoji={emojiLibrary.getIcon(emojiId)}
          skin={skin}
          index={index}
          onSelect={onSelectEmoji}
        />
      ))}
    </div>
  ),
);
EmojiPickerRow.displayName = "EmojiPickerRow";
