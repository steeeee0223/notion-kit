import { useEmojiFactory, useLucideFactory } from "../factories";
import type { IconFactoryResult } from "../factories";

export function useDefaultFactories(): IconFactoryResult[] {
  const emoji = useEmojiFactory();
  const lucide = useLucideFactory();
  return [emoji, lucide];
}
