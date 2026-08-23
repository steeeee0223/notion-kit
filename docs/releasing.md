# Releasing npm Packages

This guide is the repeatable procedure for publishing public
`@notion-kit/*` packages to npm. Follow the applicable workflow in order; do
not publish packages from a local machine.

## Choose the workflow

| Situation                                                    | Workflow                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Publishing a version of a package that already exists on npm | [Normal release](#normal-release)                                         |
| Publishing a public package to npm for the first time        | [First publication of a new package](#first-publication-of-a-new-package) |

The normal workflow uses npm trusted publishing through GitHub Actions OIDC.
It requires no local npm login and must not use `NPM_TOKEN`.

## Configure or audit npm trusted publishing

Every public package must have its own npm trusted-publisher configuration
before its normal release. A new package can be configured only after its
bootstrap publication has completed.

1. Sign in to [npmjs.com](https://www.npmjs.com/) with an account that can
   administer the package. Open **Packages**, select the exact package, then
   open **Settings**.
2. Find **Trusted publishing**. In **Select your publisher**, choose **GitHub
   Actions**.
3. Enter the following values exactly. The workflow filename is only the file
   name—not `.github/workflows/publish.yml`.

   | Field                | Value                     |
   | -------------------- | ------------------------- |
   | Organization or user | `steeeee0223`             |
   | Repository           | `notion-kit`              |
   | Workflow filename    | `publish.yml`             |
   | Environment name     | Leave empty               |
   | Allowed actions      | Select only `npm publish` |

4. Save the trusted publisher, then reopen the package settings and verify the
   saved values. `publish.yml` must exist in `.github/workflows/` and the
   publish job must retain `id-token: write` permission.

If npm does not show the trusted-publishing option, first confirm that the
package has been published and that your npm account has package-admin access.

## Normal release

Use this workflow whenever every package being published already exists on npm.

### 1. Record package changes

For each user-facing change that should result in a package release, create a
Changeset in the same pull request as the change:

```bash
pnpm changeset
```

Select the affected public packages, choose the appropriate semver bump, and
write a concise release note. Commit the generated file under `.changeset/`
with the code change.

Do not add a Changeset for changes that must not change a package version.

### 2. Prepare the release commit

Once the intended Changesets have landed on `main`, start from an up-to-date,
clean checkout of `main`:

```bash
git switch main
git pull --ff-only origin main
git status --short
```

`git status --short` must produce no output before continuing. Generate the
package versions:

```bash
pnpm changeset version
```

Review the generated changes before committing. They should contain only the
expected package version updates, dependency-range updates, lockfile changes,
and removal of the consumed Changesets:

```bash
git diff --check
git diff
```

Run the release checks:

```bash
pnpm build:packages
pnpm typecheck
pnpm test
```

If a check fails, fix the problem and rerun the failed check. Do not tag or
publish a release commit until all checks pass.

Stage and commit the reviewed version changes, then push the commit to `main`:

```bash
git add packages pnpm-lock.yaml .changeset
git commit -m "chore: version packages"
git push origin main
```

If the version command changed another tracked release file, add that file as
well. Confirm the pushed commit passed the required GitHub Actions checks
before creating the tag.

### 3. Create the release tag

Create an annotated repository release tag on the exact version commit and
push only that tag:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Replace `X.Y.Z` with the repository release identifier for this batch. The tag
does not select package versions: npm publishes the versions recorded in the
package manifests on the tagged commit. Never retag a commit after publishing;
create a new release commit and a new tag instead.

### 4. Verify publication

Pushing a `v*` tag starts **Publish to npm**. In GitHub Actions, confirm that
the workflow for that tag succeeds, including **Build packages** and
**Publish to npm**.

Then verify each expected package/version on npm (or with npm):

```bash
npm view @notion-kit/<package-name> version --registry=https://registry.npmjs.org
```

For a successful release, record the tag and the published package versions in
the release communication. If the workflow fails before publishing, correct
the release commit and create a new tag. If it partially publishes, do not
retry blindly: identify the published versions first, then prepare a new
version for any package that still needs a correction. npm versions are
immutable.

## First publication of a new package

Use this workflow only once for a public package that does not yet exist on
npm. After it succeeds, all later versions use the normal release workflow.

### 1. Prepare the package and release commit

Before the first publication, confirm that the package:

- has a `package.json` name in the `@notion-kit/` scope;
- is public (`"private"` is not `true`);
- has a version; and
- includes repository metadata for `https://github.com/steeeee0223/notion-kit.git`.

Merge the package version intended for bootstrap into `main`. Choose the npm
dist-tag deliberately: use `beta` for a prerelease or `latest` for a stable
first version. Do not use the normal tag-triggered workflow for this first
publication.

### 2. Run the bootstrap workflow

#### Create the temporary npm token

1. Sign in to [npmjs.com](https://www.npmjs.com/). Open the profile menu in the
   upper-right corner, select **Access Tokens**, and click **Generate New
   Token**.
2. Give the token a descriptive, temporary name, such as
   `notion-kit bootstrap <package-name>`, and set the shortest practical
   expiration date.
3. Under **Packages and scopes**, choose **Read and write**, then choose
   **Only select packages and scopes** and select only the `@notion-kit`
   scope (or the individual package when npm allows it). Do not grant access to
   unrelated scopes or packages.
4. Enable **Bypass two-factor authentication**. The GitHub Actions bootstrap
   publish is non-interactive and needs this permission. Do not configure an
   IP range: GitHub-hosted runner addresses are not fixed.
5. Review the token summary, click **Generate Token**, and copy the token
   immediately. npm displays the complete value only once; never place it in a
   file, commit, terminal output, or chat.

#### Add the token as a GitHub repository secret

1. Open the [`steeeee0223/notion-kit` repository settings](https://github.com/steeeee0223/notion-kit/settings).
2. In the left sidebar, choose **Secrets and variables** → **Actions**, then
   stay on the **Secrets** tab.
3. Under **Repository secrets**, click **New repository secret**.
4. Set **Name** to `NPM_BOOTSTRAP_TOKEN`, paste the copied npm token into
   **Secret**, then click **Add secret**. Confirm the secret name appears in
   the repository-secret list. The value cannot be read back.

In GitHub Actions, run **Bootstrap npm package** with these inputs:

| Input          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Branch         | `main` at the commit containing the package version      |
| `package-name` | Exact package name, such as `@notion-kit/example`        |
| `dist-tag`     | `beta` for prerelease or `latest` for stable publication |

The workflow validates the package, verifies that it is not already on npm,
builds it with its workspace dependencies, packs it, and publishes only the
selected package. Wait for the workflow to finish successfully and confirm the
published version on npm.

### 3. Enable trusted publishing and remove bootstrap access

First, use [Configure or audit npm trusted publishing](#configure-or-audit-npm-trusted-publishing)
for the newly published package. Then remove the bootstrap credential as soon
as the trusted-publisher settings have been verified:

1. In the GitHub repository, open **Settings** → **Secrets and variables** →
   **Actions**. In the **Secrets** tab, select `NPM_BOOTSTRAP_TOKEN`, choose
   **Remove**, and confirm deletion.
2. On npmjs.com, open the profile menu → **Access Tokens**, locate the
   temporary bootstrap token by its descriptive name, choose **Delete** (or
   revoke it), and confirm deletion.

The bootstrap token is not a normal-release credential and must not be kept for
future releases.

## Troubleshooting and safety rules

- A normal-release OIDC failure usually means the npm trusted-publisher
  settings do not exactly match the table above. Correct them on npmjs.com and
  rerun only when it is safe to do so.
- Do not add `NPM_TOKEN` to the normal publish workflow. OIDC provides the
  short-lived credentials for those releases.
- Do not publish from a local machine as a workaround. The GitHub workflow is
  the source of the release audit trail and npm provenance.
- Never force-push, move, or reuse a release tag. A corrected release always
  receives a new version and tag.
