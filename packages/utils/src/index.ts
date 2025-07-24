import { format } from "date-fns";

import { COLOR, type Color } from "./constants";

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem<T>(items: T[] | Record<string, T>): T {
  if (Array.isArray(items)) {
    return items.at(randomInt(0, items.length - 1))!;
  }
  const keys = Object.keys(items);
  return items[randomItem(keys)]!;
}

export function toDateString(date: Date | string | number): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function idToColor(id: string): string {
  const colors = Object.values(COLOR);
  const sum = Array.from(id).reduce((acc, x) => acc + x.charCodeAt(0), 0);
  return colors[sum % colors.length]!.hex;
}

export function getRandomColor() {
  return randomItem(Object.keys(COLOR)) as Color;
}

export { COLOR, Color };
