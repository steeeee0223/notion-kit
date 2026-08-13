# Table-view testing audit

This directory indexes observable UI contracts by responsibility. The test files
remain colocated with their implementation; these pages provide stable links and
explain why the tests exist. Do not copy a row for every `it` declaration or
maintain a hard-coded total.

## Running the audit

```bash
pnpm -F @notion-kit/table-view test
pnpm -F @notion-kit/table-view coverage
pnpm -F @notion-kit/table-view typecheck
pnpm -F @notion-kit/table-view lint
pnpm -F @notion-kit/table-view build
```

Use coverage output as diagnostic evidence. A passing test suite is required,
but coverage thresholds must only be described as passing when the configured
command actually enforces and reaches them.

## Audit directory

- [Component objects and harness](./component-harness.md)
- [Menus and plugin UI](./menus-and-plugins.md)
- [Layouts and row views](./layouts-and-row-views.md)
- [Reactivity, resources, and interactions](./reactivity-and-resources.md)

## Maintenance rule

Update an audit page when a source responsibility, observable contract, or test
file location changes. Test names may change without an audit edit when the
protected behavior remains the same.
