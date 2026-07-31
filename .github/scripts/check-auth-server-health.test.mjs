import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const checkerPath = fileURLToPath(
  new URL("./check-auth-server-health.mjs", import.meta.url),
);
const servers = [];

after(async () => {
  await Promise.all(servers.map((server) => server.close()));
});

async function startServer(handler) {
  const server = createServer(handler);
  servers.push(server);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  assert.notEqual(address, null);
  assert.equal(typeof address, "object");

  return `http://127.0.0.1:${address.port}`;
}

async function runChecker(deploymentUrl, env = {}) {
  const child = spawn(process.execPath, [checkerPath, deploymentUrl], {
    env: {
      ...process.env,
      HEALTH_CHECK_ATTEMPTS: "1",
      HEALTH_CHECK_RETRY_DELAY_MS: "0",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
  child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));

  const code = await new Promise((resolve) => child.on("close", resolve));
  return { code, stderr, stdout };
}

test("accepts the auth-server health response", async () => {
  const deploymentUrl = await startServer((request, response) => {
    if (request.url !== "/api/auth/health") {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({ service: "@notion-kit/auth-server", ok: true }),
    );
  });

  const result = await runChecker(deploymentUrl);

  assert.equal(result.code, 0, result.stderr);
});

test("rejects a response with properties outside the health contract", async () => {
  const deploymentUrl = await startServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        ok: true,
        service: "@notion-kit/auth-server",
        version: "unexpected",
      }),
    );
  });

  const result = await runChecker(deploymentUrl);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /unexpected health response/i);
});

test("rejects a non-200 health response", async () => {
  const deploymentUrl = await startServer((_request, response) => {
    response.writeHead(503, { "content-type": "application/json" });
    response.end(
      JSON.stringify({ ok: true, service: "@notion-kit/auth-server" }),
    );
  });

  const result = await runChecker(deploymentUrl);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /expected HTTP 200, received 503/i);
});

test("retries a temporarily unavailable deployment", async () => {
  let attempts = 0;
  const deploymentUrl = await startServer((_request, response) => {
    attempts += 1;

    if (attempts === 1) {
      response.writeHead(503);
      response.end("Not ready");
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({ ok: true, service: "@notion-kit/auth-server" }),
    );
  });

  const result = await runChecker(deploymentUrl, {
    HEALTH_CHECK_ATTEMPTS: "2",
  });

  assert.equal(result.code, 0, result.stderr);
  assert.equal(attempts, 2);
});

test("sends the Vercel protection bypass secret when configured", async () => {
  const deploymentUrl = await startServer((request, response) => {
    if (request.headers["x-vercel-protection-bypass"] !== "bypass-secret") {
      response.writeHead(401);
      response.end("Unauthorized");
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({ ok: true, service: "@notion-kit/auth-server" }),
    );
  });

  const result = await runChecker(deploymentUrl, {
    VERCEL_AUTOMATION_BYPASS_SECRET: "bypass-secret",
  });

  assert.equal(result.code, 0, result.stderr);
});
