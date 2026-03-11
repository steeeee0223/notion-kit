import type { BetterAuthClientPlugin } from "better-auth/client";

import type { fileUpload } from "./file-upload";

export const fileUploadClient = () => {
  return {
    id: "file-upload",
    $InferServerPlugin: {} as ReturnType<typeof fileUpload>,
  } satisfies BetterAuthClientPlugin;
};
