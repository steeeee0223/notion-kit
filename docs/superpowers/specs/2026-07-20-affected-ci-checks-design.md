# Affected CI Checks Design

## Goal

Reduce CI work by running package-level lint, format, and typecheck tasks only for packages affected by the current change, while preserving repository-wide setup and consistency checks.

## Design

- GitHub Actions checks out full Git history so Turbo can resolve the comparison commits.
- The shared setup action exports `TURBO_SCM_BASE` and `TURBO_SCM_HEAD`. Pull requests and merge queues use their event base/head SHAs, pushes to `main` use the previous/current SHAs, and feature-branch pushes compare against `origin/main`. Invalid or all-zero bases fall back to the merge base with `origin/main`; if that merge base equals the head, the previous commit is used so the change is not silently skipped.
- The shared setup action continues to run `pnpm install` for every CI job.
- The lint and typecheck jobs continue to run the unfiltered `pnpm build:packages` command before their checks.
- Root scripts dedicated to CI invoke Turbo's native `--affected` selector for lint, format, and typecheck. Dedicated scripts keep Turbo options before the task argument separator used by ESLint and Prettier.
- The lint job continues to run `pnpm lint:ws` across the entire workspace because Sherif validates cross-workspace consistency and has no package-level affected mode.
- The test job is unchanged.

## Execution Flow

1. Checkout fetches the repository history.
2. Setup resolves the event-specific Git comparison range and installs dependencies.
3. Lint and typecheck build every package with `build:packages`.
4. Turbo selects packages affected in the resolved range and runs the requested package-level check for those packages.
5. The lint job runs the whole-workspace Sherif validation independently of Turbo's affected selection.

## Failure Behavior

- Any affected package check failure fails its existing CI job.
- A `build:packages` or `lint:ws` failure still fails the job even when Turbo selects no packages for the package-level check.
- If Turbo cannot resolve the comparison branch, the command fails instead of silently claiming that there are no affected packages.

## Verification

- Validate that the installed Turbo version accepts `--affected` for all three tasks.
- Use Turbo dry-run output to confirm that affected selection changes the scheduled package set.
- Verify workflow YAML and root script wiring.
- Confirm `build:packages`, dependency installation, `lint:ws`, and test remain unfiltered.
