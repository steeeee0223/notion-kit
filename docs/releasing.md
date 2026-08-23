# Releasing npm Packages

All public `@notion-kit/*` packages are published to npm. GitHub Packages is
not used as a package registry, so consumers can install packages without a
GitHub token.

## Normal Release

The normal release workflow uses npm trusted publishing with GitHub Actions
OIDC. It does not use `NPM_TOKEN` and is triggered only when a `v*` tag is
pushed.

Before the first OIDC release, configure every public package on npmjs.com:

```text
GitHub owner: steeeee0223
Repository: notion-kit
Workflow filename: publish.yml
Allowed action: npm publish
Environment: unset
```

Prepare a release with Changesets, commit the resulting version changes, and
push a version tag from that commit:

```bash
pnpm changeset
pnpm changeset version
git commit -am "chore: version packages"
git tag vX.Y.Z
git push origin main --follow-tags
```

The `Publish to npm` workflow builds packages and runs `changeset publish
--no-private`. npm exchanges the workflow's OIDC identity for short-lived
credentials and attaches provenance to public packages automatically.

Do not add `NPM_TOKEN` back to the normal release workflow. After the first
successful OIDC release, remove the old `NPM_TOKEN` GitHub secret and revoke
the corresponding npm token.

## First Publication of a New Package

npm trusted publishing can only be configured after a package exists on npm.
The first version therefore uses the manually dispatched `Bootstrap npm
package` workflow rather than a local publish command.

1. Make the new package public and include repository metadata pointing to
   `https://github.com/steeeee0223/notion-kit.git`.
2. Merge the package version to `main`.
3. Create a temporary, narrowly scoped npm token and add it as the
   `NPM_BOOTSTRAP_TOKEN` repository secret.
4. In GitHub Actions, run `Bootstrap npm package` on `main` and provide the
   exact package name, for example `@notion-kit/example`.
5. Confirm the package exists on npm, then configure its trusted publisher with
   the normal-release values above.
6. Delete `NPM_BOOTSTRAP_TOKEN` and revoke the temporary npm token.

The bootstrap workflow rejects private packages, names outside the
`@notion-kit/` scope, and packages already present on npm. It publishes only
the package explicitly selected in the workflow input.

`@notion-kit/i18n` and `@notion-kit/validators` are public runtime packages
but are new to npm. Bootstrap each at its current version before releasing a
tag that depends on either package.
