import { auth, authEnv } from "./lib/auth";
import { createServer } from "./server";

const server = createServer({
  handler: auth.handler,
  baseURL: auth.options.baseURL,
  trustedOrigins: auth.options.trustedOrigins,
  trustedProxies: authEnv.TRUSTED_PROXY_IPS,
});
const port = Number(process.env.PORT ?? 3001);

await server.listen({ host: "0.0.0.0", port });
