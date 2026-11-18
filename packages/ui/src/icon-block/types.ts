import type { iconNodes } from "./lib/data";

export type LucideName = keyof typeof iconNodes;

export type IconData =
  | {
      type: "emoji" | "url" | "text" | "lucide";
      src: string;
      color?: string;
    }
  | { type: "lucide"; src: LucideName; color?: string };
