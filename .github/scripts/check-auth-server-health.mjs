import { setTimeout } from "node:timers/promises";
import { isDeepStrictEqual } from "node:util";

const expectedBody = {
  ok: true,
  service: "@notion-kit/auth-server",
};
const deploymentUrl = process.argv[2];
const attempts = Number(process.env.HEALTH_CHECK_ATTEMPTS ?? 5);
const retryDelayMs = Number(process.env.HEALTH_CHECK_RETRY_DELAY_MS ?? 2_000);
const protectionBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

if (!deploymentUrl) {
  throw new Error("Usage: check-auth-server-health.mjs <deployment-url>");
}

const healthUrl = new URL("/api/auth/health", deploymentUrl);

async function checkHealth() {
  const response = await fetch(healthUrl, {
    headers: protectionBypassSecret
      ? { "x-vercel-protection-bypass": protectionBypassSecret }
      : undefined,
  });

  if (response.status !== 200) {
    throw new Error(`Expected HTTP 200, received ${response.status}`);
  }

  const body = await response.json();

  if (!isDeepStrictEqual(body, expectedBody)) {
    throw new Error(`Unexpected health response: ${JSON.stringify(body)}`);
  }
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await checkHealth();
    break;
  } catch (error) {
    if (attempt === attempts) {
      throw error;
    }

    console.warn(`Health check attempt ${attempt} failed: ${error.message}`);
    await setTimeout(retryDelayMs);
  }
}

console.log(`Health check passed: ${healthUrl}`);
