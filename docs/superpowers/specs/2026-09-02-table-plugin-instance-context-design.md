# Design: Table Plugin Instance Context API

## Goal

Simplify table-view UI plugin renderer contracts so they receive only the
TanStack instance that identifies their domain scope. Move repeated data,
configuration, text conversion, mutation callbacks, and UI-scope state behind
headless instance APIs and small table-view contexts.

This follows the table UI plugin registry split: table-hook owns data and
mutation semantics; table-view owns React rendering and surface-specific state.

## Public renderer contracts

`TableUiPlugin` keeps direct React-node renderer callbacks, but their argument
types contain only an instance:

```ts
type CellProps = {
  cell: CellInstance;
};

type BulkEditorProps = {
  column: ColumnInstance;
};

type ConfigMenuProps = {
  column: ColumnInstance;
};
```

The renderer API remains explicit and easy to use:

```tsx
const customUi: TableUiPlugin<typeof customData> = {
  // metadata omitted
  renderCell: ({ cell }) => <CustomCell cell={cell} />,
  renderBulkEditor: ({ column }) => <CustomBulkEditor column={column} />,
  renderConfigMenu: ({ column }) => <CustomConfigMenu column={column} />,
  renderGroupingValue: () => null,
};
```

The previous fields are removed from these props:

- cell: `propId`, `row`, `data`, `config`, `property`, `textValue`, `wrapped`,
  `disabled`, `onChange`, and `onConfigChange`;
- bulk: `propId`, `data`, `config`, `rowIds`, `selectedValues`, `label`,
  `icon`, `disabled`, `onChange`, and `onConfigChange`;
- config: `propId`, `config`, `onChange`, and `onOpenChange`.

## Headless instance APIs

Add a dedicated table-hook cell API feature rather than putting cell methods in
`ColumnsInfoFeature`. A cell spans both a row and a column, while
`ColumnsInfoFeature` owns column metadata only.

```ts
interface CellPluginCellApi<TPlugin extends CellPlugin> {
  getData(): InferData<TPlugin>;
  getTextValue(): string;
  update(updater: Updater<InferData<TPlugin>>): void;
}
```

Each method delegates to existing headless state:

- `getData()` reads the cell value for `cell.row` and `cell.column`;
- `getTextValue()` uses `cell.column.getPlugin().toTextValue(data, row)`;
- `update()` delegates to the existing column `updateCell(row.id, updater)`.

Do not duplicate existing column APIs. UI components continue to obtain
`cell.column.getInfo()`, `cell.column.getPlugin()`, and
`cell.column.updateConfig()` from the column instance.

Extend the existing row-actions column API with:

```ts
column.updateCells(rowIds, value);
```

It delegates to table-level `updateCells(rowIds, column.id, value)` and lets a
bulk editor mutate its selected rows without receiving a callback prop.

Neither feature may expose React nodes, renderer callbacks, UI-plugin data,
surface information, or display icons.

## Table-view UI contexts

TanStack instances do not know their table-view surface or transient UI state.
Keep that information in narrow table-view contexts:

- `useTableViewCellContext()` supplies the current cell surface. It is provided
  by `Cell.Root`; the cell instance itself is supplied through `CellProps`.
- `useBulkEditorContext()` supplies the bulk editor's disabled state. Selected
  rows come from `table.getSelectedRowIds()` and are not passed as props.
- `useTableViewCtx()` remains the global entry point for the table and paired
  UI-plugin registry.

For example, a built-in cell can read a concise, stable domain API without
repeating table lookups:

```tsx
function TextCell({ cell }: CellProps) {
  const { surface } = useTableViewCellContext();
  const { table } = useTableViewCtx();
  const disabled = table.getTableGlobalState().locked;

  return (
    <CellRenderer
      value={cell.getData()}
      copyValue={surface === "table" ? cell.getTextValue() : undefined}
      disabled={disabled}
      onChange={cell.update}
    />
  );
}
```

The `onChange` shown above is a local leaf-component prop, not a public
`TableUiPlugin` renderer contract. Leaf components may retain focused props for
testability and reuse.

`BulkEditorPopover` resolves the effective trigger label and icon internally:
column name and custom icon come from `column.getInfo()`; the fallback comes
from the matched UI adapter. This preserves the current persisted-icon
precedence without exposing `label` or `icon` on `BulkEditorProps`.

`ConfigMenuProps` no longer needs an open-change callback: current callers do
not supply one.

## Grouping

`renderGroupingValue` remains a separate contract. A grouping header can
represent an empty or aggregate group rather than a real cell, so it cannot
rely on `CellInstance`. Its current grouping value input remains unchanged.

## Migration and compatibility

This is an intentional breaking change. There is no compatibility overload for
the prior rich renderer prop objects. Custom adapters migrate from inline
destructuring to a component that receives the relevant instance.

```tsx
// Before
renderCell: ({ data, config, onChange }) => (
  <CustomEditor data={data} config={config} onChange={onChange} />
)

// After
renderCell: ({ cell }) => <CustomCell cell={cell} />
```

Built-in data factories remain imported from `@notion-kit/table-hook/plugins`;
built-in UI adapters remain imported from `@notion-kit/table-view`.

## Verification

Implement test-first, covering:

1. A cell instance returns data and canonical text and updates only its own
   cell.
2. A column instance bulk-updates every selected row.
3. Built-in cell, bulk, and config adapters render solely from their instance
   props and retain lock behavior.
4. Custom paired data/UI plugins compile with all three reduced renderer
   contracts.
5. Table, list, board, row-view, timeline, bulk editing, and grouping retain
   their existing behavior.
6. table-hook and table-view tests, typechecks, lint, format checks, docs
   typecheck/build, and Storybook typecheck pass.

## Non-goals

- Adding React or UI plugin state to table-hook.
- Moving grouping rendering onto a cell instance.
- Retaining the previous renderer prop contract.
