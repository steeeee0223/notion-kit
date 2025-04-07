import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideName = keyof typeof dynamicIconImports;

export type IconData =
  | { type: "emoji" | "url" | "text"; src: string }
  | { type: "lucide"; src: string; color?: string };
