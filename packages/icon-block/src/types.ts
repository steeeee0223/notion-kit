import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideName = keyof typeof dynamicIconImports;

export type IconData =
  | {
      type: "emoji" | "url" | "text" | "lucide";
      src: string;
      color?: string;
    }
  | { type: "lucide"; src: LucideName; color?: string };
