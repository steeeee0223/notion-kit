export const COLOR = {
  default: "#55534E",
  gray: "#A6A299",
  brown: "#9F6B53",
  yellow: "#CB912F",
  orange: "#D9730D",
  green: "#448361",
  blue: "#337EA9",
  purple: "#9065B0",
  pink: "#C14C8A",
  red: "#D44C47",
} as const;

export type Color = keyof typeof COLOR;
