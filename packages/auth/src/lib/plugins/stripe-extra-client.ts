import type { BetterAuthClientPlugin } from "better-auth/client";

import type { stripeExtra } from "./stripe-extra";

export const stripeExtraClient = () => {
  return {
    id: "stripe-extra",
    $InferServerPlugin: {} as ReturnType<typeof stripeExtra>,
  } satisfies BetterAuthClientPlugin;
};
