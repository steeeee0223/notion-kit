import { RegistryItem } from "@notion-kit/validators";

export const theme: RegistryItem = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  extends: "none",
  title: "Notion Theme",
  name: "notion-theme",
  type: "registry:style",
  dependencies: ["tailwind-merge", "clsx"],
  registryDependencies: ["utils"],
  cssVars: {
    theme: {
      /* Shadow styles */
      "shadow-notion":
        "--alpha(var(--blue) / 57%) 0 0 0 1px inset, --alpha(var(--blue) / 35%) 0 0 0 2px",
      "shadow-header-row":
        "var(--bg-main) -3px 0px 0px, var(--border-cell) 0px -1px 0px inset",
      "shadow-header-sticky":
        "var(--bg-main) -3px 0px 0px, var(--border-cell) -1px -1px 0px inset",
      "shadow-cell-focus":
        "--alpha(var(--blue) / 57%) 0px 0px 0px 2px inset, --alpha(var(--blue) / 35%) 0px 0px 0px 1px inset",
      "shadow-l-pinned": "-1px 0 0 var(--border-cell) inset",
      "shadow-out-md": "var(--sha-out-md)",
      /* Text size */
      "leading-tight": "1.2",
      /* Animation */
      "animate-bg": "background 200ms ease",
      "animate-bg-in": "background 20ms ease-in",
      "animate-bg-out": "background 200ms ease-out",
      /* Z indexes */
      "z-col": "30",
      "z-row": "40",
      "z-menu": "50",
    },
    light: {
      base: "50 48 44",
      /* General color */
      blue: "rgb(35, 131, 226)",
      "blue-hover": "rgb(0, 119, 212)",
      red: "rgb(235, 87, 87)",
      orange: "rgb(218, 163, 64)",
      /* Text color */
      default: "rgb(var(--base))",
      primary: "rgb(44, 44, 43)",
      secondary: "rgb(142, 139, 134)",
      muted: "rgba(70, 68, 64, 0.45)",
      icon: "rgb(168, 164, 156)",
      "icon-primary": "#383836",
      "icon-secondary": "#8e8b86",
      "menu-icon": "rgba(73, 72, 70)",
      "tooltip-primary": "rgba(255, 255, 255, 0.9)",
      "tooltip-secondary": "rgba(206, 205, 202, 0.6)",
      "sidebar-primary": "rgb(95, 94, 91)",
      /* Background color */
      "bg-main": "rgb(255, 255, 255)",
      "bg-sidebar": "rgb(249, 248, 247)",
      "bg-modal": "rgb(255, 255, 255)",
      "bg-popover": "rgb(255, 255, 255)",
      "bg-tooltip": "rgb(15, 15, 15)",
      "bg-input": "rgba(242, 241, 238, 0.6)",
      "bg-timeline": "rgb(253, 253, 253)",
      "bg-timeline-dark": "rgba(55, 53, 47, 0.03)",
      /* Border color */
      border: "rgba(var(--base) / 0.1)",
      "border-button": "rgba(var(--base) / 0.15)",
      "border-cell": "rgb(233, 233, 231)",
      ring: "rgba(15, 15, 15, 0.1)",
      /** Radius */
      radius: "0.5rem",
      /* Shadows */
      "sha-out-md":
        "0px 8px 12px 0px #19191907, 0px 2px 6px 0px #19191907, 0px 0px 0px 1px #2a1c0012",
    },
    dark: {
      base: "255 255 255",
      /* Text color */
      default: "rgb(var(--base))",
      primary: "rgb(240, 239, 237)",
      secondary: "rgba(168, 164, 156)",
      muted: "rgba(var(--base) / 0.3)",
      icon: "rgba(128, 125, 120)",
      "icon-primary": "#e6e5e3",
      "icon-secondary": "#ada9a3",
      "menu-icon": "rgba(230, 229, 227)",
      "tooltip-primary": "rgba(211, 211, 211, 1)",
      "tooltip-secondary": "rgba(127, 127, 127, 1)",
      "sidebar-primary": "rgb(155, 155, 155)",
      /* Background color */
      "bg-main": "rgb(25, 25, 25)",
      "bg-sidebar": "rgb(32, 32, 32)",
      "bg-modal": "rgb(32, 32, 32)",
      "bg-popover": "rgb(37, 37, 37)",
      "bg-tooltip": "rgb(47, 47, 47)",
      "bg-input": "rgba(255, 255, 255, 0.055)",
      "bg-timeline": "rgb(247, 247, 247)",
      "bg-timeline-dark": "rgba(255, 255, 255, 0.02)",
      /* Border color */
      "border-cell": "rgb(47, 47, 47)",
      ring: "rgba(255, 255, 255, 0.075)",
      /* Shadows */
      "sha-out-md": "0px 0px 0px 1px #383836, 0px 4px 12px -2px #19191914",
    },
  },
  files: [],
};
