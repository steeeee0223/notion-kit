---
name: verify-table-view
description: Verify implemented table-view and table-hook capabilities from their source-based feature map, using real browser interactions and observable resource effects. Use for plugin behavior, editing, property configuration, sorting, grouping, filtering, calculations, selection, layouts, and consumer contracts.
---

# Verify table-view and table-hook

Read [the feature map](features/README.md) and the linked product implementation before choosing a journey. `packages/table-view/src` and `packages/table-hook/src` define the capabilities and entry points. Existing tests are supporting evidence, not the feature inventory.

The [plugin matrix](features/plugin-behaviors.md) maps all 12 built-ins to their sorting, grouping, filtering, calculation, and UI behavior. For a plugin change, cover its affected interactions and layouts; an editor round-trip alone does not verify its organizing semantics.

Drive the real `TableView` consumer in `apps/e2e`. It imports built `packages/table-view/dist` and `packages/table-hook/dist`. Reuse the existing E2E specs, fixtures, and page objects in `apps/e2e/tests`. The feature map determines what to verify; those tests provide reusable execution paths.

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

The [Playwright config](assets/playwright.config.mts) extends `apps/e2e/playwright.config.ts` and points at the existing `apps/e2e/tests` directory. It only adapts server ownership, serial execution, and evidence output. It does not contain test scenarios or replace the repository's fixtures.

Do not run the normal `test:e2e` script while this server is running: it rebuilds and its default config tries to own the same port.

Choose an affected capability from the source-based map, then inspect the existing specs for a matching user path. List candidates without driving the app:

```bash
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright test --config "$VERIFY_CONFIG" --list
```

Run the matching existing specs or cases serially. For example, this existing case exercises a numeric filter through the toolbar and checks its view resource effect:

```bash
set -o pipefail
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright test filtering.spec.ts --config "$VERIFY_CONFIG" --grep 'Filtering_NumericRuleLifecycle' --max-failures=1 2>&1 | tee "$VERIFY_ARTIFACTS/drive.log"
```

Require the selected cases to pass with exit 0. Stop on the first failure, run Doctor, and triage before further driving. Allocate a fresh evidence directory for each invocation because Playwright clears its `tests` output directory.

During maintenance, exercise every feature file at least once. Existing cases may cover those paths. Where coverage is missing, drive the map's recipe in a live browser and retain the action log, screenshots, and observable effects. A single numeric-filter test does not prove the nested-filter recipe or every filtering entry point.

Keep this skill focused on the source map, operation recipes, and harness instructions. Do not add another spec suite or fixture layer under the skill. Temporary probes belong in run scratch space and are removed after their evidence is saved. Lasting regression tests belong in `apps/e2e/tests` through a separate change; maintenance does not edit that suite or product code.

Reuse `TableViewObject` and the other existing component objects when driving with Playwright. Scope controls by row, property, menu, or group. Use real pointer and keyboard actions; derive drag coordinates from located elements. Read the current UI when an existing locator is stale and report the harness gap.

For hook-only logic, supplement the browser proof with the relevant package test. For example:

```bash
nvm use 24.11.1 --silent && CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test src/__tests__/resource-api.test.tsx
```

Hook tests can supplement the source contract, especially owner rejection, custom plugins, and pure methods. Unit checks do not replace user-entry proof or define which capabilities belong in the map.

## Evidence

Preserve the absolute `VERIFY_ARTIFACTS` directory. An E2E run retains `results.json`, `report/index.html`, and per-test `tests/**/trace.zip` and screenshots alongside the launch and drive logs. The trace records actions, assertions, DOM snapshots, and network activity; a final screenshot alone is insufficient. Additional attachments depend on the existing test.

For a live browser recipe, save before/after accessibility snapshots and the visible parent/rendered resource diagnostics. In a temporary Playwright probe, reuse `apps/e2e/tests/fixtures.ts` and attach this evidence with `testInfo.attach`. Capture screenshots at the relevant state, especially before closing an editor or clearing a selection. Read diagnostics only; never mutate them, call internal setters, or inject state to substitute for the user action being proved.

Verify the visible outcome and the applicable side effect: resource change, clipboard value, popup URL, or uploaded blob URL. After edits, compare parent/rendered resources or reopen the value through another surface. Search, basic grouping, and calculations use internal state; grouping methods and group ordering can write view resources. Use the source contract for the exact action.

Keep fixture-only buttons (`Reset controlled state`, `Apply plugin configuration scenario`, `Open locked Alpha row`) as setup or parent-prop synchronization checks. They do not prove the corresponding end-user configuration controls. Likewise, existing force-click/dispatch checks on disabled controls are guard tests, not a substitute for an unlocked user journey.

Use mocks only at an existing production boundary. No request mocks are needed for the core fixture. Full-page/new-tab fixture URLs reach an unimplemented route; a URL assertion proves handoff only. The product also has an inline Full-page fallback when the consumer provides no URL, which this fixture does not exercise. Link/icon journeys can open tabs, write the clipboard, or request remote images; inspect those effects and the network trace.

Record tested feature IDs, entry points, commands, exit codes, and skipped paths in `summary.md` within the evidence directory. Distinguish source-mapped features from paths actually exercised. Browser coverage, if enabled with `E2E_COVERAGE=1`, currently filters to table-view source only; do not claim table-hook coverage from that report.

## Cleanup

After success or failure, send Ctrl-C to the retained server PTY and wait for it to exit. Playwright closes the browser contexts it created. Close any extra inspection tabs you opened. Never use `pkill`, `killall`, or kill a PID discovered merely by port lookup. If the PTY is lost, establish that a PID belongs to this run before terminating it.

Run `lsof -nP -iTCP:3001 -sTCP:LISTEN` again. No listener is expected; investigate a remaining listener without killing unrelated processes. Keep shared build outputs and all evidence. Remove only scratch specs or state that this run created.

For an E2E run, confirm that cleanup preserved the proof:

```bash
test -s "$VERIFY_ARTIFACTS/results.json"
test -s "$VERIFY_ARTIFACTS/report/index.html"
rg --files "$VERIFY_ARTIFACTS/tests" | rg '(trace\.zip|\.png)$'
```

For direct browser driving, check the saved action log, snapshots, and screenshots instead. Report the absolute evidence path and which mapped paths passed. A failed or skipped drive is not a completed verification.

## Helpers

- `assets/playwright.config.mts` is a runner-loaded override for the existing E2E suite. Invoke it through the Drive command; it requires absolute `VERIFY_ARTIFACTS`.
- Existing executable harness: the pinned Playwright runner, using the Node/store bootstrap above. No standalone helper scripts are shipped.
- Existing specs, fixtures, and page objects: `apps/e2e/tests/`. Reuse them; this skill does not own a second test suite.
- To refresh these recipes after product changes, use `/maintain-verification-skill` with this directory and its feature map.
