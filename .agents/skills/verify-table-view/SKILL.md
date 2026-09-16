---
name: verify-table-view
description: Verify implemented table-view and table-hook capabilities from their source-based feature map, using real browser interactions and observable resource effects. Use for table editing, property configuration, filters, grouping, selection, layouts, and consumer contracts.
---

# Verify table-view and table-hook

Read [the feature map](features/README.md) and the linked product implementation before choosing a journey. `packages/table-view/src` and `packages/table-hook/src` define the capabilities and entry points. Existing tests are supporting evidence, not the feature inventory.

Drive the real `TableView` consumer in `apps/e2e`. It imports built `packages/table-view/dist` and `packages/table-hook/dist`. The skill owns representative browser journeys derived from the map; they reuse existing page objects for interaction, without importing or invoking existing E2E specs.

The primary surface is Chromium at `/table-view/controlled` or `/table-view/uncontrolled`. The hook also has a library API; use its focused unit tests for contracts with no browser entry point. Storybook is a secondary development surface, not the build verification target.

## Launch

Run from the repository root. Inspect current `AGENTS.md`, `package.json`, `pnpm-workspace.yaml`, and lockfile before running package commands. The checked-in manager is pnpm 11.0.8; the required bootstrap is nvm Node 24.11.1. Run package build, test, lint, and typecheck commands outside the sandbox as instructed by `AGENTS.md`.

Create a new evidence directory for each Playwright invocation. Keep its absolute path and reuse it across terminal/tool sessions:

```bash
export VERIFY_REPO="$PWD"
mkdir -p "$VERIFY_REPO/apps/e2e/test-results"
export VERIFY_ARTIFACTS="$(mktemp -d "$VERIFY_REPO/apps/e2e/test-results/verify-table-view-XXXXXXXX")"
export VERIFY_CONFIG="$VERIFY_REPO/.agents/skills/verify-table-view/assets/playwright.config.mts"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
git rev-parse HEAD > "$VERIFY_ARTIFACTS/revision.txt"
git status --short > "$VERIFY_ARTIFACTS/worktree.txt"
```

This directory is ignored by Git. Do not place evidence in a temporary directory that cleanup deletes.

Check `lsof -nP -iTCP:3001 -sTCP:LISTEN` before launch. No listener is the expected result (exit 1). If a listener exists, stop here and identify its owner. Do not kill or reuse another run's server. This recipe cannot run concurrently in one checkout: port 3001, package `dist`, Next `.next`, and optional coverage output are shared. A second port alone does not isolate the build. Use a separate checkout and deliberately adapt the origin-dependent clipboard and icon tests if concurrent verification is required.

Build the packages and production app using its existing pretest script. This rebuilds table-hook through table-view's dependency graph:

```bash
set -o pipefail
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e pretest:e2e 2>&1 | tee "$VERIFY_ARTIFACTS/build.log"
```

Require exit 0 and `apps/e2e/.next/BUILD_ID`. Next skips TypeScript validation here; a build is not a typecheck. Do not rebuild while the verification server is running.

Start the following in a dedicated, retained PTY/terminal session. Record its session ID for cleanup:

```bash
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec next start -H 127.0.0.1 -p 3001 2>&1 | tee "$VERIFY_ARTIFACTS/server.log"
```

Require Next's `Ready` line, then run Doctor. Both routes need no auth, environment secrets, database, or network seed. They start with `Alpha`, `Empty`, and `Omega`, 12 properties, table layout, side peek, and an unlocked view. Fixture data lives in React memory. Navigation or reload restores defaults.

If Chromium is missing, install the pinned browser once, then retry:

```bash
nvm use 24.11.1 --silent && pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright install chromium
```

## Doctor

Run this read-only check after launch and whenever a drive behaves unexpectedly. Re-export the saved absolute `VERIFY_ARTIFACTS` path in a new shell. Require the live listener to belong to the retained launch session; inspect the PID, parent, and working directory instead of assuming that an HTTP response proves ownership.

```bash
set -e
VERIFY_SERVER_PID="$(lsof -t -nP -iTCP:3001 -sTCP:LISTEN | head -n 1)"
test -n "$VERIFY_SERVER_PID"
{
	ps -p "$VERIFY_SERVER_PID" -o pid=,ppid=,command=
	lsof -a -p "$VERIFY_SERVER_PID" -d cwd
	cat apps/e2e/.next/BUILD_ID
} | tee "$VERIFY_ARTIFACTS/doctor.txt"
curl --fail --silent --show-error --max-time 15 http://127.0.0.1:3001/table-view/controlled -o "$VERIFY_ARTIFACTS/doctor-controlled.html"
curl --fail --silent --show-error --max-time 15 http://127.0.0.1:3001/table-view/uncontrolled -o "$VERIFY_ARTIFACTS/doctor-uncontrolled.html"
rg -q 'Controlled table view' "$VERIFY_ARTIFACTS/doctor-controlled.html"
rg -q 'Uncontrolled table view' "$VERIFY_ARTIFACTS/doctor-uncontrolled.html"
```

The process must be Next in this checkout's `apps/e2e`; both HTTP requests and heading checks must succeed. The successful current build log establishes build freshness. This checks server readiness; Playwright checks hydration and interaction.

If installation, build, or tests fail, first capture `node --version`, `"$NVM_BIN/pnpm" --version`, `"$NVM_BIN/pnpm" store path`, and the repository's runtime/package-manager declarations. Diagnose the actual failure before changing tooling. Do not read authentication files. Before retrying a failed browser journey, run Doctor again and use a fresh browser context. Preserve the failed run's evidence; retain a healthy owned server while it remains useful for the pass.

## Drive

The shipped [Playwright config](assets/playwright.config.mts) runs [the skill-owned journeys](assets/source-journeys.spec.mts), preserves the repository's coverage fixture, and retains successful traces, screenshots, accessibility snapshots, and resource JSON. The `.mts` modules work outside the E2E package's module boundary. The config uses the owned server and does not launch or stop one.

Do not run the normal `test:e2e` script while this server is running: it rebuilds and its default config tries to own the same port.

Run one representative journey per feature file, serially, stopping at the first failure so Doctor and triage happen before further driving:

```bash
set -o pipefail
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright test --config "$VERIFY_CONFIG" --max-failures=1 2>&1 | tee "$VERIFY_ARTIFACTS/drive.log"
```

Require five passed journeys and exit 0. They cover cancel/commit and List title editing; real Number configuration through header and row-detail menus; nested And/Or filters through Settings and the active badge; row selection/bulk overwrite/lock; and Timeline opening through sidebar and bar. This is representative feature coverage, not proof of every sub-feature or consumer configuration.

For a targeted run, append `--grep 'editing-and-resources'`, `properties`, `finding-and-organizing`, `selection-and-row-actions`, or `layouts-and-row-views`. Allocate a fresh evidence directory for every invocation because Playwright clears its `tests` output directory. Use the map's other user paths when a change affects an entry not covered by the representative journey.

During skill maintenance, keep new journeys and harness corrections inside this skill. Import `test` and `expect` from its local `./fixtures.mts`, which extends the repository fixture. Reuse `TableViewObject` from `apps/e2e/tests/component-objects/table-view.ts` and its existing methods directly. Scope controls by row/property/menu/group; use real pointer/keyboard actions and derive drag coordinates from located elements. Do not edit product code or existing E2E tests during a maintenance pass.

For hook-only logic, supplement the browser proof with the relevant package test. For example:

```bash
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test src/__tests__/resource-api.test.tsx
```

Hook tests can supplement the source contract, especially owner rejection, custom plugins, and pure methods. Unit checks do not replace user-entry proof or define which capabilities belong in the map.

## Evidence

Preserve the absolute `VERIFY_ARTIFACTS` directory. It contains build/server/doctor/drive logs, the Git revision and working-tree status, `results.json`, `report/index.html`, and per-test `tests/**/trace.zip` and screenshots. The trace records actions, assertions, DOM snapshots, and network activity; a final screenshot alone is insufficient.

For custom journeys, attach before/after `page.locator("main").ariaSnapshot()` text and `table.controlledSnapshot()` or `table.renderedResourceSnapshot()` JSON with `testInfo.attach`. Capture screenshots at the relevant state, especially before closing an editor or clearing a selection. Read diagnostics only; never mutate them, call internal setters, or inject state to substitute for the user action being proved.

Verify the visible outcome and the applicable side effect: resource change, clipboard value, popup URL, or uploaded blob URL. After edits, compare parent/rendered resources or reopen the value through another surface. Search, basic grouping, and calculations use internal state; grouping methods and group ordering can write view resources. Use the source contract for the exact action.

Keep fixture-only buttons (`Reset controlled state`, `Apply plugin configuration scenario`, `Open locked Alpha row`) as setup or parent-prop synchronization checks. They do not prove the corresponding end-user configuration controls. Likewise, existing force-click/dispatch checks on disabled controls are guard tests, not a substitute for an unlocked user journey.

Use mocks only at an existing production boundary. No request mocks are needed for the core fixture. Full-page/new-tab fixture URLs reach an unimplemented route; a URL assertion proves handoff only. The product also has an inline Full-page fallback when the consumer provides no URL, which this fixture does not exercise. Link/icon journeys can open tabs, write the clipboard, or request remote images; inspect those effects and the network trace.

Record tested feature IDs, entry points, commands, exit codes, and skipped paths in `summary.md` within the evidence directory. Distinguish source-mapped features from paths actually exercised. Browser coverage, if enabled with `E2E_COVERAGE=1`, currently filters to table-view source only; do not claim table-hook coverage from that report.

## Cleanup

After success or failure, send Ctrl-C to the retained server PTY and wait for it to exit. Playwright closes the browser contexts it created. Close any extra inspection tabs you opened. Never use `pkill`, `killall`, or kill a PID discovered merely by port lookup. If the PTY is lost, establish that a PID belongs to this run before terminating it.

Run `lsof -nP -iTCP:3001 -sTCP:LISTEN` again. No listener is expected; investigate a remaining listener without killing unrelated processes. Keep shared build outputs and all evidence. Remove only scratch specs or state that this run created.

Confirm that cleanup preserved the proof:

```bash
test -s "$VERIFY_ARTIFACTS/results.json"
test -s "$VERIFY_ARTIFACTS/report/index.html"
rg --files "$VERIFY_ARTIFACTS/tests" | rg '(trace\.zip|\.png)$'
```

Report the absolute evidence path and which mapped paths passed. A failed or skipped drive is not a completed verification.

## Helpers

- `assets/playwright.config.mts`, `assets/source-journeys.spec.mts`, and `assets/fixtures.mts` are runner-loaded modules. Invoke them through the Drive command; the config requires absolute `VERIFY_ARTIFACTS`.
- Existing executable harness: the pinned Playwright runner, using the Node/store bootstrap above. No standalone helper scripts are shipped.
- Existing page objects: `apps/e2e/tests/component-objects/`. Reuse them; any maintenance-specific extension stays in this skill's directory.
- To refresh these recipes after product changes, use `/maintain-verification-skill` with this directory and its feature map.
