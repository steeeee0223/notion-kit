# `@notion-kit/table-hook`

`table-hook` is the headless domain and state engine behind notion-kit tables.
It turns serializable table resources and property plugins into a TanStack Table
instance. A rendering package, such as `table-view`, uses that instance to
provide cells, menus, editors, and layouts.

## Package boundary

`table-hook` owns table meaning and state transitions:

- table data, properties, and view resources;
- property-plugin contracts for values, text, sorting, grouping, counting, and
  filtering;
- table features, row-model composition, and plugin-method resolution;
- pure utilities for dates, numbers, grouping, and calculations.

It does not own presentation. Cell components, icons, menus, picker controls,
and layout-specific interactions belong to a consumer such as `table-view`.
Data-plugin factories accept only UI-neutral data semantics. Consumers pair
those plugins with their own UI adapters, keeping the headless package free of
renderer and icon contracts.

The dependency direction is one-way:

```text
application resources + plugin registry
                  │
                  ▼
            @notion-kit/table-hook
                  │  TanStack Table API and headless contracts
                  ▼
           @notion-kit/table-view (or another UI)
```

## Core architecture

`useTableView` is the composition root. It resolves the three table resources,
normalizes view defaults, builds a property entity and TanStack column
definitions, then applies the default feature set to create the table
instance.

```text
Data + Properties + View
          │
          ▼
  resource ownership and normalization
          │
          ├── property plugins → column definitions and value semantics
          ├── plugin methods   → sorting, grouping, and counting behavior
          └── table features   → TanStack state and row-model pipeline
                                      │
                                      ▼
                             table instance for the UI
```

The default row-model pipeline combines global search, persisted advanced
filters, grouping, sorting, and expansion. Features extend the TanStack table
with table-specific capabilities such as property metadata, row actions,
freezing, counting, menus, advanced filtering, and extended grouping.

## Resources and ownership

The table is modelled as three independently owned, serializable resources:

| Resource   | Represents                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Data       | rows and cell values                                                    |
| Properties | property definitions, ordering, visibility, and configuration           |
| View       | layout, filters, grouping, sorting, lock state, and other view settings |

Each resource can be controlled by the application or initialized internally
with a default value. On a user action, `table-hook` derives both the next
resource value and a structured action. For controlled resources it calls the
corresponding change callback; the application commits the new value by
rendering it back. For uncontrolled resources it commits the value internally.

This protocol keeps persistence outside the package while giving consumers a
serializable action stream for undo, analytics, collaboration, or storage.
A committed controlled value also rebases any pending proposal, so the table
always reflects the application's authoritative state.

## Property plugins

A `CellPlugin` defines how one property type participates in the table domain.
Its stable ID and default data/configuration make the type persistable; its
conversion functions translate stored values into usable values and canonical
text; optional capabilities define how the property sorts, groups, counts, and
filters. Rendering, icons, editors, and presentation metadata are not part of
this contract; `table-view` represents them with a matching `TableUiPlugin`.

Methods and filter operators likewise use stable IDs and UI-neutral metadata.
The engine resolves configured IDs through the plugin registry and falls back
to supported defaults when necessary. Persisted resources therefore carry
configuration, while executable behavior remains in the registered plugins.

## Public entry points

- `@notion-kit/table-hook` provides `useTableView`, table contexts, resource
  types, features, filtering utilities, and method resolvers.
- `@notion-kit/table-hook/plugins` provides property-plugin factories and
  plugin contracts.
- `@notion-kit/table-hook/fns` provides pure utility functions.
- `@notion-kit/table-hook/mock` provides test-oriented fixtures and helpers.

## Documentation map

- [Plugin contracts and capability policy](./plugins.md)
- [Testing audit index](./testing/README.md)
- [Resource and feature-state audit](./testing/resources-and-features.md)
