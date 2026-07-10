import { useEmojiFactory } from "./emoji";
import { useLucideFactory } from "./lucide";
import { useUploadFactory } from "./upload";

export function useDefaultFactories() {
  const emoji = useEmojiFactory();
  const lucide = useLucideFactory();
  const upload = useUploadFactory();
  return [emoji, lucide, upload];
}
