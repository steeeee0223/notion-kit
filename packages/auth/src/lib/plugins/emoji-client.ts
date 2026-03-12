import type { BetterAuthClientPlugin } from "better-auth/client";

import type { emoji } from "./emoji";

export const emojiClient = () => {
  return {
    id: "emoji",
    $InferServerPlugin: {} as ReturnType<typeof emoji>,
  } satisfies BetterAuthClientPlugin;
};
