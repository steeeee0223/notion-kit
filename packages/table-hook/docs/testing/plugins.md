# Plugin contract audit

## Responsibility

Protect the headless plugin API: defaults, conversions, transfer behavior,
capability registration, and pure plugin utilities. UI rendering and menu
interaction are audited in [`table-view`](../../../table-view/docs/testing/menus-and-plugins.md).

## Invariants

- Built-in factories expose complete behavioral descriptors through
  `@notion-kit/table-hook/plugins`.
- Data plugins contain no rendering, icon, or bulk-edit contract; those belong
  to matching table-view UI adapters.
- Bulk-edit eligibility is UI capability-based: the matching adapter supplies
  an optional bulk renderer.
- A bulk functional updater starts from `plugin.default.data`, is evaluated
  once, and is handed to the UI host as one atomic selected-row update.
- Stable method IDs and resolver fallbacks remain compatible with old resources
  and legacy `compare`, `toValue`, and `toGroupValue` implementations.
- Plugin conversion and comparison handle empty, invalid, and boundary values
  deterministically.
- Headless tests do not import `table-view`.

## Source and tests

- Contract and factory types: [`src/plugins/types.ts`](../../src/plugins/types.ts)
- Built-in registrations: [`src/plugins/`](../../src/plugins/)
- Plugin matrix and semantics: [`docs/plugins.md`](../plugins.md)
- Registration and mixed-plugin contracts: [`plugins.test.ts`](../../src/plugins/plugins.test.ts)
- Number formatting: [`format.test.ts`](../../src/plugins/number/format.test.ts)
- Date utilities: [`utils.test.ts`](../../src/plugins/date/utils.test.ts)

## Update this audit when

Add or update coverage when a plugin adds a capability, changes conversion or
default data, changes empty-value semantics, changes renderer/editor
capabilities, or changes the factory config surface.
