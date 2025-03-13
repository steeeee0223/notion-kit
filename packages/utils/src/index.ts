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
