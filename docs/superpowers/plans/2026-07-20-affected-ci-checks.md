# Affected CI Checks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run package-level lint, format, and typecheck only for packages affected by each CI event while keeping installation, package builds, workspace lint, and tests unfiltered.

**Architecture:** The setup composite action receives the GitHub event's comparison SHAs, validates them, and exports Turbo's `TURBO_SCM_BASE`/`TURBO_SCM_HEAD` environment variables. Dedicated root scripts place Turbo's `--affected` option before the task argument separator, and the workflow invokes those scripts while preserving the existing full-workspace steps.

**Tech Stack:** GitHub Actions, Bash, pnpm 11.0.8, Turborepo 2.10.5

## Global Constraints

- `pnpm install` runs for every job through the shared setup action.
- `pnpm build:packages` remains unfiltered in lint and typecheck jobs.
- `pnpm lint:ws` remains an unfiltered whole-workspace check.
- The test job remains unchanged apart from receiving the common checkout/setup behavior.

---

### Task 1: Wire event-aware affected checks

**Files:**

- Modify: `tooling/github/setup/action.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`

**Interfaces:**

- Consumes: GitHub event base/head SHA expressions passed as composite-action inputs.
- Produces: `TURBO_SCM_BASE` and `TURBO_SCM_HEAD` job environment variables; `lint:affected`, `format:affected`, and `typecheck:affected` root scripts.

- [x] **Step 1: Verify the affected scripts do not exist yet**

Run: `pnpm run lint:affected --help`

Expected: non-zero exit with `ERR_PNPM_NO_SCRIPT`.

- [x] **Step 2: Add comparison inputs and normalized Turbo SCM environment variables**

Add optional `base` and `head` inputs to `tooling/github/setup/action.yml`. Before installation, validate the supplied SHAs with `git cat-file -e`; treat an all-zero push base as invalid; use `git merge-base HEAD origin/main` as the base fallback and `HEAD` as the head fallback. Append both resolved values to `$GITHUB_ENV`:

```yaml
inputs:
  base:
    description: "Git revision used as the affected comparison base"
    required: false
  head:
    description: "Git revision used as the affected comparison head"
    required: false

runs:
  using: composite
  steps:
    - name: Configure Turbo SCM range
      if: inputs.base != '' || inputs.head != ''
      shell: bash
      env:
        INPUT_BASE: ${{ inputs.base }}
        INPUT_HEAD: ${{ inputs.head }}
      run: |
        base="$INPUT_BASE"
        head="$INPUT_HEAD"

        if [[ -z "$head" ]] || ! git cat-file -e "${head}^{commit}" 2>/dev/null; then
          head="HEAD"
        fi

        if [[ -z "$base" ]] || [[ "$base" =~ ^0+$ ]] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
          base="$(git merge-base "$head" origin/main)"

          if [[ "$(git rev-parse "$base")" == "$(git rev-parse "$head")" ]] && git cat-file -e "${head}^" 2>/dev/null; then
            base="${head}^"
          fi
        fi

        echo "TURBO_SCM_BASE=$base" >> "$GITHUB_ENV"
        echo "TURBO_SCM_HEAD=$head" >> "$GITHUB_ENV"
```

- [x] **Step 3: Add affected-only root scripts**

Add these scripts to `package.json`, preserving the existing unfiltered scripts for local use:

```json
"format:affected": "turbo run format --affected --continue -- --cache --cache-location .cache/.prettiercache",
"lint:affected": "turbo run lint --affected --continue -- --cache --cache-location .cache/.eslintcache",
"typecheck:affected": "turbo run typecheck --affected"
```

- [x] **Step 4: Pass event ranges and invoke affected scripts in CI**

For the lint, format, and typecheck checkouts in `.github/workflows/ci.yml`, configure `fetch-depth: 0`. Pass these setup inputs in those three jobs:

```yaml
with:
  base: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && github.event.before || github.event.pull_request.base.sha || github.event.merge_group.base_sha || 'origin/main' }}
  head: ${{ github.event.pull_request.head.sha || github.event.merge_group.head_sha || github.sha }}
```

Replace only the package-level commands:

```yaml
- name: Lint
  run: pnpm lint:affected && pnpm lint:ws

- name: Format
  run: pnpm format:affected

- name: Typecheck
  run: pnpm typecheck:affected
```

Keep `pnpm build:packages`, setup installation, `pnpm lint:ws`, and `pnpm test` unfiltered.

- [x] **Step 5: Validate scripts and affected selection**

Run:

```bash
pnpm exec turbo run lint --affected --dry-run=json
pnpm exec turbo run format --affected --dry-run=json
pnpm exec turbo run typecheck --affected --dry-run=json
```

Expected: every command exits zero and returns a Turbo dry-run document whose scheduled task names match the requested task.

Run a controlled range using `TURBO_SCM_BASE=origin/main TURBO_SCM_HEAD=HEAD` for each command and inspect the `packages`/`tasks` output to confirm Turbo does not schedule every workspace indiscriminately.

- [x] **Step 6: Validate configuration and preserved full-workspace steps**

Run:

```bash
pnpm exec prettier --check .github/workflows/ci.yml tooling/github/setup/action.yml package.json
rg -n "fetch-depth: 0|build:packages|lint:affected|lint:ws|format:affected|typecheck:affected|pnpm test" .github/workflows/ci.yml package.json
```

Expected: Prettier passes; all four preserved unfiltered commands and all three affected scripts appear in the workflow/script wiring.

- [ ] **Step 7: Commit the implementation**

```bash
git add .github/workflows/ci.yml tooling/github/setup/action.yml package.json docs/superpowers/specs/2026-07-20-affected-ci-checks-design.md docs/superpowers/plans/2026-07-20-affected-ci-checks.md
git commit -m "ci: run checks for affected packages"
```
