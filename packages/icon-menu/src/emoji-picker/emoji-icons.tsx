import React from "react";
import {
  AppleIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  LeafIcon,
  LightbulbIcon,
  MusicIcon,
  SmileIcon,
  StarIcon,
} from "lucide-react";

import { EmojiCategoryList } from "./types";

export const emojiCategoryIcons: Record<EmojiCategoryList, React.ReactElement> =
  {
    frequent: <ClockIcon className="size-full" />,
    people: <SmileIcon className="size-full" />,
    nature: <LeafIcon className="size-full" />,
    foods: <AppleIcon className="size-full" />,
    activity: (
      <svg
        className="size-full"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2.1 13.4A10.1 10.1 0 0 0 13.4 2.1" />
        <path d="m5 4.9 14 14.2" />
        <path d="M21.9 10.6a10.1 10.1 0 0 0-11.3 11.3" />
      </svg>
    ),
    places: <CompassIcon className="size-full" />,
    objects: <LightbulbIcon className="size-full" />,
    symbols: <MusicIcon className="size-full" />,
    flags: <FlagIcon className="size-full" />,
    custom: <StarIcon className="size-full" />,
  };

/**
 * className: style="width: 28px; height: 28px; display: block; fill: rgb(145, 145, 142); flex-shrink: 0; transform: scale(1.1);"
 * size-7 block fill-[#91918e] flex-shrink-0 transform-scale-1.1
 */
export const CirclePlus: React.FC<{ className?: string }> = ({ className }) => (
  <svg role="graphics-symbol" viewBox="0 0 28 28" className={className}>
    <path d="M14 22c-4.369 0-8-3.631-8-8 0-4.376 3.624-8 7.992-8C18.37 6 22 9.624 22 14c0 4.369-3.623 8-8 8zm-3.828-7.992c0 .4.283.667.69.667h2.456v2.462c0 .4.274.69.674.69.408 0 .69-.282.69-.69v-2.463h2.463c.4 0 .69-.266.69-.666 0-.408-.29-.69-.69-.69h-2.463v-2.455c0-.408-.282-.698-.69-.698-.4 0-.674.29-.674.698v2.455h-2.455c-.408 0-.69.282-.69.69z"></path>
  </svg>
);
