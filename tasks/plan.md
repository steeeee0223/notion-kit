# Implementation Plan: OIDC npm Publishing

## Overview

Move normal package releases from a long-lived `NPM_TOKEN` to npm trusted
publishing with GitHub Actions OIDC. Publish the two currently private runtime
dependencies to npm, and add a separately dispatched, token-based bootstrap
workflow for a future package's first release.

## Architecture Decisions

- npmjs remains the public registry; GitHub Packages is not used for package
  installation.
- `.github/workflows/publish.yml` is OIDC-only and runs only on `v*` tags.
- npm trusted publishers are configured per package on npmjs.com and authorize
  `steeeee0223/notion-kit`'s `publish.yml` workflow.
- A new package's first publication uses an explicitly invoked bootstrap
  workflow plus a temporary, narrowly scoped secret; no normal release can
  fall back to this secret.

## Task List

### Phase 1: Make the public dependency graph publishable

- [x] Task 1: Publish `@notion-kit/i18n` and `@notion-kit/validators`.
  - Remove their `private` flags and add repository metadata matching the
    existing publishable package pattern.
  - Verify their packed manifests include the intended public metadata and
    published runtime dependencies.

### Phase 2: Convert tag releases to OIDC

- [x] Task 2: Remove token authentication from `publish.yml`.
  - Remove the `NPM_TOKEN` configuration step and reduce repository access to
    `contents: read` while retaining `id-token: write`.
  - Keep the existing `v*` trigger, Changesets publication command, and package
    build step.
  - Verify the workflow is syntactically valid and has no token fallback.

### Checkpoint: Normal releases

- [x] Public runtime dependencies can be packed.
- [x] The normal publish workflow requests an OIDC ID token and contains no
      `NPM_TOKEN` reference.

### Phase 3: Add new-package bootstrap automation

- [x] Task 3: Add a manually dispatched bootstrap workflow.
  - Require an explicit `@notion-kit/*` package input.
  - Reject private packages and packages that already exist on npm.
  - Build and publish only the selected package with
    `NPM_BOOTSTRAP_TOKEN` and public access.
  - Document that a maintainer configures npm trusted publishing after the
    first publication and immediately removes the temporary secret.

### Checkpoint: Bootstrap safety

- [x] The bootstrap workflow is `workflow_dispatch` only.
- [x] It cannot publish a non-`@notion-kit` or private package.
- [x] It never runs in the normal tag release path.

### Phase 4: Validate and hand off

- [x] Task 4: Validate package contents, YAML syntax, and relevant formatting.
- [x] Task 5: Update the release documentation with tag release and
      new-package bootstrap instructions.

### Checkpoint: Complete

- [x] All repository validation commands pass.
- [ ] npm trusted publishers are configured for existing packages before a
      production tag is pushed.
- [ ] `NPM_TOKEN` is removed only after the first OIDC release is verified.

## Risks and Mitigations

| Risk                               | Impact                                     | Mitigation                                                                                   |
| ---------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| A package has no trusted publisher | Tag release fails                          | Configure every current package before the first tag release; do not add a token fallback.   |
| Bootstrap secret is retained       | Elevated publish credential remains usable | Use a separate `NPM_BOOTSTRAP_TOKEN`, then delete it after trusted publishing is configured. |
| A bad tag triggers a release       | Unintended public package version          | Protect `v*` tags and release only commits that passed CI.                                   |
| Package tarball is incomplete      | Consumer installation fails                | Inspect `pnpm pack --dry-run` output before publication.                                     |

## Open Questions

- Configuration-only workflow changes require approval to use YAML and package
  packing validation instead of test-first unit tests.
