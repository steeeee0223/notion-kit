import type { Skin } from "@emoji-mart/data";

/**
 * Emoji: type Emoji = { id: string; name: string; keywords: string[]; skins: [
 * { unified: '1f389'; native: '🎉'; shortcodes: ':tada:'; } ]; version: 1; };
 */

export interface IconData {
  id: string;
  name: string;
  keywords: string[];
  skins: Skin[]; // TODO redefine this
}
