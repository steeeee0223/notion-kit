import { defineStory } from "@/lib/story";
import { mapMap } from "@/stories/development.lazy";

export const DarkTheme = defineStory({
  Component: mapMap.DarkThemeExample,
  displayName: "Dark Theme",
  args: { initial: { zoom: 13, theme: "dark" } },
  frame: {
    src: "/story/development/map/map/DarkTheme",
    width: 1280,
    height: 800,
  },
});
export const LightTheme = defineStory({
  Component: mapMap.LightThemeExample,
  displayName: "Light Theme",
  args: { initial: { zoom: 11, theme: "light" } },
  frame: {
    src: "/story/development/map/map/LightTheme",
    width: 1280,
    height: 800,
  },
});
export const Globe = defineStory({
  Component: mapMap.GlobeExample,
  displayName: "Globe",
  args: { initial: { zoom: 1.5 } },
  frame: { src: "/story/development/map/map/Globe", width: 1280, height: 800 },
});
export const ControlledViewport = defineStory({
  Component: mapMap.ControlledViewportExample,
  displayName: "Controlled Viewport",
  args: { initial: {} },
  frame: {
    src: "/story/development/map/map/ControlledViewport",
    width: 1280,
    height: 800,
  },
});
