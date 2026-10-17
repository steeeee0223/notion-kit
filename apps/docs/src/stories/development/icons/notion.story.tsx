import { defineStory } from "@/lib/story";
import { iconsNotion } from "@/stories/development.lazy";

export const Notion = defineStory({
  Component: iconsNotion.IconGallery,
  frame: {
    src: "/story/development/icons/notion/Notion",
    width: 1280,
    height: 800,
  },
});
