# Config-driven table plugins design

## Context

The built-in table plugins currently have split ownership. `@notion-kit/table-hook`
defines the common `CellPlugin` contract and placeholder title/text plugins, while
`@notion-kit/table-view` owns the complete built-in implementations, including
data conversion, sorting, grouping, calculations, React renderers, and icons.
This makes the behavioral plugin layer depend conceptually on a specific UI and
prevents consumers from reusing the built-in semantics with their own components.

This branch is an architectural migration only. It must not change the existing
table-view design, rendered output, interaction behavior, persisted method IDs,
or data semantics.

## Goals

- Make `@notion-kit/table-hook/plugins` the only public entry point for headless
  plugin factories and plugin contracts.
- Move every built-in plugin's non-UI behavior into `table-hook`.
- Make every built-in factory a function that requires UI configuration.
- Keep `@notion-kit/table-view` factories as no-argument functions that inject
  the current icons and components.
- Preserve developer-defined custom plugins and allow them to coexist with
  built-in plugins.
- Move plugin behavior documentation and tests to `table-hook` while retaining
  component and interaction tests in `table-view`.

## Non-goals

- Redesigning cells, menus, grouping labels, icons, or interactions.
- Changing plugin IDs, default data/config, conversion rules, method IDs,
  sorting/grouping/counting behavior, or compatibility fallbacks.
- Requiring custom plugins to use an internal factory or registry.
- Adding runtime config validation or a new dependency.
- Preserving plugin imports from the `@notion-kit/table-hook` root entry point.

## Public package boundaries

### `@notion-kit/table-hook/plugins`

This subpath is the only public headless plugin API. It exports:

- `CellPlugin` and its supporting/inference types;
- plugin-specific data and column config types;
- plugin UI config types;
- config-driven factories for `title`, `text`, `checkbox`, `select`,
  `multiSelect`, `number`, `email`, `phone`, `url`, `date`, `createdTime`, and
  `lastEditedTime`;
- plugin-related pure utilities that are part of the existing public surface.

`packages/table-hook/package.json` and `tsdown.config.ts` will expose a real
`./plugins` build entry. The `table-hook` root entry stops re-exporting plugin
APIs, and repository consumers that need a plugin contract or headless factory
must import from `@notion-kit/table-hook/plugins`.

`table-hook` will not publish a `DEFAULT_PLUGINS` containing placeholder or null
renderers. Its table feature initializes the plugin entity without fabricated
defaults; `useTableView` continues to receive the actual configured plugin
entity from its caller.

### `@notion-kit/table-view`

`table-view` continues to export the same no-argument factory names and its
UI-configured `DEFAULT_PLUGINS` from the package root. Each factory is a thin
wrapper over the matching `table-hook/plugins` factory and supplies only the
current icon and renderer callbacks. `TableView` continues to use this configured
default list when its `plugins` prop is omitted.

This is intentionally a breaking import-path change for headless plugin APIs,
but not a factory-call change for `table-view` consumers:

```tsx
import { title as createHeadlessTitle } from "@notion-kit/table-hook/plugins";
import { title as createTableViewTitle } from "@notion-kit/table-view";

const headlessTitle = createHeadlessTitle({
  icon: <CustomTitleIcon />,
  renderCell: (props) => <CustomTitleCell {...props} />,
});

const tableViewTitle = createTableViewTitle();
```

## Factory configuration contract

Every factory receives a typed config based on the plugin it returns. The shared
shape is conceptually:

```ts
interface PluginConfig<TPlugin extends CellPlugin> {
  icon: React.ReactNode;
  defaultIcon?: React.ReactNode;
  renderCell: TPlugin["renderCell"];
  renderConfigMenu?: TPlugin["renderConfigMenu"];
  renderGroupingValue?: TPlugin["renderGroupingValue"];
}
```

Plugin-specific aliases expose only the callbacks that the plugin can use. The
factory assigns `icon` to `meta.icon` and `defaultIcon ?? icon` to
`default.icon`. `renderCell` is required because it is required by `CellPlugin`;
config-menu and grouping-value renderers remain optional. The table-view wrappers
provide both icon variants so the existing `fill-menu-icon` styling and property
icon rendering do not change.

Adapters that express plugin semantics remain in `table-hook`. Examples include
the title icon visibility rule, single-select normalization, and deriving created
or edited timestamps from a row. The injected callback is responsible only for
rendering the prepared props. This keeps `table-view` wrappers limited to wiring
existing UI components.

## Custom plugin compatibility

`CellPlugin` remains an open structural contract. Developers may:

- create a `CellPlugin<Id, Data, Config>` object directly;
- create their own config-driven factory;
- use a built-in `table-hook/plugins` factory with custom renderers; or
- mix any of the above with the configured factories from `table-view` in one
  `TableView` `plugins` array.

There is no registry allow-list, built-in ID switch, or factory-only registration
path. Generic calculation, sorting, grouping, column, and menu discovery continue
to operate from the supplied plugin descriptors.

## Source ownership

`packages/table-hook/src/plugins/<type>/` owns:

- plugin and factory config types;
- metadata, defaults, conversions, transfer rules, comparators, and descriptors;
- generic, checkbox, number, and date calculation registrations;
- pure number/date formatting used by calculation descriptors;
- select conversion/config state that is not tied to a rendered menu;
- renderer prop adaptation before invoking the injected callbacks.

`packages/table-view/src/plugins/<type>/` owns:

- cell, config-menu, selection-menu, picker, and grouping-value components;
- component hooks and UI-only reducers where applicable;
- no-argument wrappers that supply current icons and components;
- UI rendering and interaction tests.

Dependencies remain one-way: `table-view` may import `table-hook/plugins`, but
`table-hook` must never import `table-view`.

## Default plugin assembly

The generic/checkbox counting policy and number/date calculation descriptors
move beside the headless factories. A factory result therefore already contains
its complete behavioral capabilities. `table-view` no longer decorates plugin
objects with behavioral enhancers; it only assembles the configured results into
`DEFAULT_PLUGINS` in the existing order.

`DefaultPlugins` continues to describe the table-view default list. Consumers
that assemble a custom headless list infer its union from their own factory
results rather than from an unusable headless default list.

## Documentation migration

Move `packages/table-view/docs/plugins.md`, `plugins-1.png`, and `plugins-2.png`
to `packages/table-hook/docs/`. Update the document so built-in data semantics,
method capability policy, and custom-plugin discovery are described as
`table-hook` responsibilities. Examples that use plugin contracts or headless
factories import from `@notion-kit/table-hook/plugins`; examples specifically
using configured UI factories may import from `@notion-kit/table-view`.

## Testing strategy

Implementation follows red-green-refactor. Before moving production behavior,
add focused tests that fail because the configured factory/subpath does not yet
exist or because behavior still lives in `table-view`.

Tests moved to `table-hook` cover:

- required and optional factory config wiring, including `defaultIcon` fallback;
- every built-in registration matrix and descriptor fallback;
- scalar conversion, sorting boundaries, grouping, and counting;
- select conversion and transfer behavior;
- number/date formatting and calculation descriptors;
- date-derived plugin contracts;
- direct custom `CellPlugin` compatibility and mixed plugin arrays;
- the absence of any `table-view` dependency from headless tests.

Tests retained in `table-view` cover:

- cell rendering and edit/resource interactions;
- config menus, selection menus, date pickers, and inputs;
- grouping-value component rendering;
- wrapper delegation and the configured `DEFAULT_PLUGINS` order;
- current icons and renderer components being supplied without UI regressions.

## Migration sequence

1. Establish the `/plugins` export and shared factory config contract with failing
   public-API tests.
2. Move shared behavior, then migrate plugin families in small vertical slices.
3. For each family, move its headless tests first, implement the configured
   factory, and replace the table-view implementation with a wrapper.
4. Assemble the table-view defaults without behavioral decorators and update all
   imports to the new ownership boundary.
5. Move and revise documentation, then run full package and repository-consumer
   verification.

## Verification

Use the repository-declared Node.js and pnpm versions. Run focused Vitest files
during each red-green cycle. At completion, run test, typecheck, lint, format,
and build for both `@notion-kit/table-hook` and `@notion-kit/table-view`, then
verify affected Storybook, docs, registry, and e2e consumers compile with the new
imports. A source search must find no plugin-contract imports from the
`table-hook` root and no headless behavior implemented in table-view wrappers.
