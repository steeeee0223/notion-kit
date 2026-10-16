import { defineStory } from "@/lib/story";

import {
  ControlledViewportExample,
  DarkThemeExample,
  GlobeExample,
  LightThemeExample,
} from "./map.lazy";

export const DarkTheme = defineStory({
  Component: DarkThemeExample,
  displayName: "Dark Theme",
  args: { initial: { zoom: 13, theme: "dark" } },
  frame: {
    src: "/story/development/map/map/DarkTheme",
    width: 1280,
    height: 800,
  },
});
export const LightTheme = defineStory({
  Component: LightThemeExample,
  displayName: "Light Theme",
  args: { initial: { zoom: 11, theme: "light" } },
  frame: {
    src: "/story/development/map/map/LightTheme",
    width: 1280,
    height: 800,
  },
});
export const Globe = defineStory({
  Component: GlobeExample,
  displayName: "Globe",
  args: { initial: { zoom: 1.5 } },
  frame: { src: "/story/development/map/map/Globe", width: 1280, height: 800 },
});
export const ControlledViewport = defineStory({
  Component: ControlledViewportExample,
  displayName: "Controlled Viewport",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map/ControlledViewport",
    width: 1280,
    height: 800,
  },
});
