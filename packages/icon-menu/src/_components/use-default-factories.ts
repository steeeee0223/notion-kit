import {
  useEmojiFactory,
  useLucideFactory,
  useUploadFactory,
} from "../factories";
import type { IconFactoryResult } from "../factories";

export function useDefaultFactories(): IconFactoryResult[] {
  const emoji = useEmojiFactory();
  const lucide = useLucideFactory();
  const upload = useUploadFactory();
  return [emoji, lucide, upload];
}
