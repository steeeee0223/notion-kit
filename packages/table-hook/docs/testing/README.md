# Table-hook testing audit

This directory is an index of behavior-oriented audits. It intentionally does
not copy every test declaration or freeze a test-count baseline. The source test
files are the executable inventory; these pages explain what each area protects
and link to the relevant files.

## Running the audit

Use the package scripts with the repository-declared Node and pnpm versions:

```bash
pnpm -F @notion-kit/table-hook test
pnpm -F @notion-kit/table-hook typecheck
pnpm -F @notion-kit/table-hook lint
pnpm -F @notion-kit/table-hook build
```

Every test should either catch a production regression, document a non-obvious
headless contract, or verify a real resource/state transition. Avoid adding
tests that only assert implementation shape.

## Audit directory

- [Plugin contracts and pure plugin behavior](./plugins.md)
- [Methods, sorting, grouping, and calculations](./methods-and-grouping.md)
- [Resources, features, and table state](./resources-and-features.md)

## Maintenance rule

Update an audit page when a source area changes responsibility, a public
invariant changes, or a test file is added/removed/renamed. Do not update it for
every test-name change when the protected contract is unchanged.
