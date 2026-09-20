import {
  createEmailSender,
  type EmailTemplateId,
  type SendEmailOptions,
} from "@better-auth/infra";

import type { AuthEnv } from "@/env";

export function createAuthEmailSender(env: AuthEnv) {
  const sender = createEmailSender({
    apiKey: env.BETTER_AUTH_API_KEY,
    apiUrl: env.BETTER_AUTH_API_URL,
  });
  return async <T extends EmailTemplateId>(email: SendEmailOptions<T>) => {
    const result = await sender.send(email);
    if (!result.success) throw new Error("Email delivery failed");
  };
}
