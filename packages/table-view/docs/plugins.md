# Table-view plugin responsibilities

The canonical data-plugin contract and built-in data semantics live in
[`@notion-kit/table-hook/plugins`](../../table-hook/docs/plugins.md). This page
documents the React UI boundary.

## Paired registration

`TableView` accepts one registry pair:

```tsx
const plugins = {
  data: [customDataPlugin],
  ui: [customUiPlugin],
};

<TableView plugins={plugins} />;
```

Every UI adapter must have the same `id` as a data plugin. Registry creation
rejects duplicate IDs, missing adapters, and adapters without data plugins.
There is no array or combined-plugin compatibility path.

## What a UI adapter provides

`TableUiPlugin` owns all React values and display metadata:

- required `renderCell`, which returns the complete cell UI for its surface;
- optional `renderBulkEditor`, whose presence enables bulk editing;
- optional `renderConfigMenu` for property configuration;
- required `renderGroupingValue` for group labels;
- menu labels, descriptions, icons, and default widths.

Cell adapters receive only a TanStack cell instance. Its feature APIs provide
column information, the data plugin, cell data, a text value, and `update()`.
Bulk and configuration adapters receive only a TanStack column instance. It
provides property metadata/configuration, selected row IDs, cell access,
`updateCells()`, and `updateConfig()`. They choose their trigger, popover,
empty state, copy affordance, and layout classes.

## UI ownership by source area

| Area                           | Responsibility                                                               |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `src/common/cell.tsx`          | Resolves the paired adapter and invokes its direct cell renderer.            |
| `src/common/cell-renderer.tsx` | Reusable trigger, popover, compact-frame, copy, and empty-state composition. |
| `src/plugins/<type>/`          | Built-in UI adapters, editors, configuration menus, and grouping labels.     |
| `src/common/bulk-edit/`        | Invokes optional adapter bulk renderers.                                     |
| `src/menus/`                   | Reads data capabilities and UI metadata without built-in type branches.      |

Title and checkbox are ordinary adapters: title owns its table/list/timeline
composition and checkbox owns direct cell and bulk interaction. Grouped table
and board layouts resolve the grouping column's adapter by its data-plugin ID.

## Extension rule

Keep semantics in a `CellPlugin` from `@notion-kit/table-hook/plugins`, and
place rendering in a matching `TableUiPlugin` from `@notion-kit/table-view`.
Do not put React nodes, presentation choices, icons, or renderer callbacks on a
data plugin. Generic menus discover sorting, grouping, filtering, and counting
from the data plugin; they discover display metadata from the UI adapter.

## Application-provided property data

The built-in people, relation, and place editors read application data through
`TableView`'s optional `propertySources` prop. For example, pass
`propertySources={{ people, currentActor, databases, searchLocations }}` to
populate the pickers. The place editor also accepts a manual name and address
or coordinates from the browser's location permission.

The ID adapter edits the prefix in the property menu. Relation and rollup
adapters configure the target database or calculation and render the resolved
value in the same table and row surfaces as other properties. See the
[table-hook property contracts](../../table-hook/docs/plugins.md#id-people-places-and-related-rows)
for the cross-database callbacks and the sequence allocator.

## Related audits

See the [table-view testing audit](./testing/README.md) for component and
interaction contracts that protect this boundary.
