import { randomItem } from "@notion-kit/utils";

export const COLOR = {
  default: "rgba(255, 255, 255, 0.094)",
  gray: "rgba(255, 255, 255, 0.13)",
  brown: "rgba(184, 101, 67, 0.45)",
  orange: "rgba(233, 126, 35, 0.45)",
  yellow: "rgba(250, 177, 67, 0.5)",
  green: "rgba(45, 153, 100, 0.5)",
  blue: "rgba(51, 126, 169, 0.5)",
  purple: "rgba(168, 91, 242, 0.34)",
  pink: "rgba(220, 76, 145, 0.4)",
  red: "rgba(222, 85, 83, 0.45)",
};

export type Color = keyof typeof COLOR;

export function getRandomColor() {
  return randomItem(Object.keys(COLOR)) as Color;
}
