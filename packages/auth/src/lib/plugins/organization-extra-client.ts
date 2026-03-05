import type { BetterAuthClientPlugin } from "better-auth/client";

import type { organizationExtra } from "./organization-extra";

export const organizationExtraClient = () => {
  return {
    id: "organization-extra",
    $InferServerPlugin: {} as ReturnType<typeof organizationExtra>,
  } satisfies BetterAuthClientPlugin;
};
