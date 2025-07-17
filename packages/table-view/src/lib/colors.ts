import { randomItem } from "@notion-kit/utils";

export const COLOR = {
  default: { name: "Default", rgba: "rgba(255, 255, 255, 0.094)" },
  gray: { name: "Gray", rgba: "rgba(255, 255, 255, 0.13)" },
  brown: { name: "Brown", rgba: "rgba(184, 101, 67, 0.45)" },
  orange: { name: "Orange", rgba: "rgba(233, 126, 35, 0.45)" },
  yellow: { name: "Yellow", rgba: "rgba(250, 177, 67, 0.5)" },
  green: { name: "Green", rgba: "rgba(45, 153, 100, 0.5)" },
  blue: { name: "Blue", rgba: "rgba(51, 126, 169, 0.5)" },
  purple: { name: "Purple", rgba: "rgba(168, 91, 242, 0.34)" },
  pink: { name: "Pink", rgba: "rgba(220, 76, 145, 0.4)" },
  red: { name: "Red", rgba: "rgba(222, 85, 83, 0.45)" },
};

export type Color = keyof typeof COLOR;

export function getRandomColor() {
  return randomItem(Object.keys(COLOR)) as Color;
}
