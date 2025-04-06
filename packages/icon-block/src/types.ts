import dynamicIconImports from "lucide-react/dynamicIconImports";

export type LucideName = keyof typeof dynamicIconImports;
export type IconInfo =
  | { type: "lucide"; name: LucideName; color?: string }
  | { type: "emoji"; emoji: string }
  | { type: "file"; url: string }
  | { type: "text"; text: string };
