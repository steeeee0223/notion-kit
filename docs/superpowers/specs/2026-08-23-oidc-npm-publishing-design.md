# OIDC npm Publishing Design

## Goal

Publish every runtime `@notion-kit/*` dependency to the public npm registry
without running a publish command locally or retaining an npm automation token
in the normal release workflow.

## Scope

This design covers:

- Making the internal packages required at runtime publicly resolvable.
- Replacing token-based npm publishing in the tag-triggered GitHub Actions
  workflow with npm trusted publishing over OIDC.
- Documenting the bootstrap path for a package's first release.

## Non-Goals

This design does not move packages to GitHub Packages. GitHub Packages requires
install-time authentication, which conflicts with the requirement that anyone
can install `@notion-kit/*` packages directly from npm.

It does not change the existing Changesets versioning process or make release
tags automatically. A maintainer still prepares the version commit and pushes
a `v*` tag; the workflow performs the build and publication.

## Public Runtime Dependency Graph

Every workspace package that appears in the `dependencies` of a publicly
published package must itself be public on npm. In particular,
`@notion-kit/i18n` and `@notion-kit/validators` must no longer be marked
`private: true`.

Both packages must include repository metadata matching this repository exactly.
The directory is `packages/i18n` for `@notion-kit/i18n` and
`packages/validators` for `@notion-kit/validators`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/steeeee0223/notion-kit.git",
    "directory": "packages/i18n"
  }
}
```

The existing Changesets setting of `"access": "public"` remains the source
of truth for the first public publication of scoped packages.

## Normal Release Flow

The existing `.github/workflows/publish.yml` remains triggered only by pushed
tags matching `v*`.

```text
version commit on main → push vX.Y.Z tag → GitHub Actions builds packages
→ Changesets publishes changed public packages to npm
```

The publishing job runs on `ubuntu-latest` and grants only the permissions it
needs:

```yaml
permissions:
  contents: read
  id-token: write
```

`contents: write` is removed because this workflow does not create releases or
write repository contents. `id-token: write` permits the npm CLI to exchange
the GitHub Actions OIDC identity for short-lived publishing credentials.

The workflow removes the `Setup npm authentication` step and all references to
`secrets.NPM_TOKEN`. No publish token is provided to the normal release job.
With a configured trusted publisher, npm detects the GitHub Actions OIDC
environment during `npm publish`; trusted publishing also creates npm
provenance attestations automatically.

## npm Trusted Publisher Configuration

Each currently published public package is configured once on npmjs.com with:

```text
GitHub owner: steeeee0223
Repository: notion-kit
Workflow filename: publish.yml
Allowed action: npm publish
Environment: unset
```

The configuration is package-specific. The repository URL in each package's
metadata must match the GitHub repository exactly. After the first OIDC release
has succeeded, the old `NPM_TOKEN` GitHub Actions secret should be removed and
the corresponding npm token revoked.

## New Package Bootstrap Policy

npm can only attach a trusted publisher to an existing npm package. Therefore
OIDC cannot create a brand-new package's first version.

To keep first publication off a developer workstation, a separate,
manually-dispatched bootstrap workflow will publish the selected new public
package using a temporary npm token. This workflow is intentionally not
tag-triggered and is only for first publication. It must:

1. Accept an explicit workspace package name and validate that it is a public
   package with a version that does not already exist on npm.
2. Build and pack only the selected package and its required workspace build
   dependencies.
3. Publish the initial version to npm with `--access public`, authenticated by
   a narrowly scoped temporary bootstrap token.
4. Stop before publishing any other workspace packages.

After that first release, a maintainer configures the package's npm trusted
publisher with the normal `publish.yml` values above, verifies a later tag
release through OIDC, and revokes the bootstrap token. Normal releases must
never fall back to this token.

## Error Handling And Guardrails

- A normal tag release fails fast if a package lacks a trusted-publisher
  configuration; it must not use a token fallback.
- The bootstrap workflow rejects private packages, package names outside the
  `@notion-kit/` scope, and already-published versions.
- The bootstrap token is stored only as a GitHub Actions secret while needed;
  it is deleted after trusted publishing is verified.
- Tag protection restricts who can create `v*` tags, because a trusted
  publisher authorizes the configured workflow to publish when its tag trigger
  runs.

## Verification

The implementation will validate configuration rather than add production-code
unit tests:

- YAML parse and actionlint checks pass for both workflows.
- The normal workflow contains no `NPM_TOKEN` or npm authentication setup and
  declares `id-token: write` with `contents: read`.
- `pnpm pack --dry-run` confirms that `i18n` and `validators` have publishable
  tarballs and runtime workspace dependencies resolve to publishable versions.
- A non-production GitHub Actions run or the next tagged release confirms npm
  accepts OIDC publication and emits provenance.
- The bootstrap workflow is manually exercised only for a future new package;
  its protections are tested with invalid inputs before it is used for a real
  package.

## Rollout

1. Make the two runtime internal packages public and add their repository
   metadata.
2. Change `publish.yml` to OIDC-only publishing.
3. Add the bootstrap workflow and release-maintainer documentation.
4. Validate package tarballs and workflow syntax.
5. Push a version tag containing the two newly public packages and verify the
   OIDC publishing path.
6. Remove `NPM_TOKEN` from GitHub and revoke the npm token after verification.
