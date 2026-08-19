# Specification: Cell Plugin Editor Composition

## Status

Approved for planning on 2026-08-19. This specification supersedes only the
cell-renderer composition described in
[`2026-08-15-table-view-bulk-edit-design.md`](./2026-08-15-table-view-bulk-edit-design.md).
Its row-action and atomic bulk-mutation decisions remain unchanged.

## Objective

Make the plugin registry the sole UI extension point for both single-cell and
bulk editing. Adding a plugin type must require no branch, import, or type-ID
switch in `BulkEditColumn`.

Split the existing `CellPlugin.renderCell` into a required value renderer and
an optional editor renderer. A single editor implementation is then usable in
both scopes. Checkbox is an inline editor rather than an exception in generic
bulk-edit code.

## Scope and Constraints

- This is an intentional breaking change. Remove `renderCell`; do not add a
  legacy fallback or compatibility union.
- `renderCellValue` is required. `renderCellEditor` is optional.
- A column appears in bulk edit exactly when
  `plugin.renderCellEditor !== undefined && !plugin.disableBulkEdit`.
- `disableBulkEdit` prevents only bulk exposure. It does not imply that a
  single cell lacks an editor.
- Preserve existing CSS classes, dimensions, spacing, value visibility rules,
  and popover placement. No visual refresh is in scope.
- Migrate table, list, board property cells, timeline, and row view together.
  Keep `BoardCard` title editing view-specific; it is a card/row interaction,
  not a normal property-cell renderer.
- Do not change the table-hook bulk mutation/resource-action contracts or add
  dependencies.

## Plugin Contract

`@notion-kit/table-hook/plugins` owns the typed capability contract. Its
factory configuration accepts the two view-owned React callbacks; table-view
wrappers inject the built-in implementations.

```ts
interface CellValueProps<Data, Config> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
  layout?: LayoutType | "row-view";
  tooltip?: { title: string; description?: string };
}

interface CellEditorProps<Data, Config> {
  propId: string;
  data: Data;
  config: Config;
  disabled?: boolean;
  layout?: LayoutType | "row-view";
  onChange: OnChangeFn<Data>;
  onConfigChange?: OnChangeFn<Config>;
  scope:
    | { kind: "cell"; row: Row }
    | { kind: "bulk"; rowIds: string[]; selectedValues: Data[] };
}

type CellEditorResult =
  | { presentation: "inline"; content: React.ReactNode }
  | {
      presentation: "popover";
      content: React.ReactNode;
      popover?: CellEditorPopoverOptions;
    };

interface CellPlugin<Key, Data, Config> {
  // Existing data, conversion, grouping, sorting, and counting capabilities.
  renderCellValue: (props: CellValueProps<Data, Config>) => React.ReactNode;
  renderCellEditor?: (props: CellEditorProps<Data, Config>) => CellEditorResult;
}
```

`CellEditorPopoverOptions` represents only the existing placement and content
surface options needed by the generic host (for example class name, side,
alignment, and offsets). It is not a new styling system. The implementation
uses the existing Base UI `PopoverContent` API/types rather than duplicating
them.

The established capability names are deliberate: `renderCellValue` cannot
mutate, while `renderCellEditor` owns the type-specific editing interaction.
Every built-in factory, custom fixture, documentation example, and test helper
must adopt the new contract in the same change.

## Shared Composition

Introduce a table-view host that builds the typed value/editor props from a
column and mutation target, calls the plugin callbacks, and renders the result.
The host has no built-in plugin-type conditionals.

For a normal cell:

1. `renderCellValue` renders the existing visible value for the requested
   layout.
2. A `popover` editor uses that value as its existing cell trigger and renders
   the returned content in the configured popover surface.
3. An `inline` editor renders its returned control in place. Its implementation
   may compose the same pure value subcomponent used by `renderCellValue`.
4. A missing editor leaves the value display-only.

For a bulk column:

1. The host supplies `plugin.default.data` as the neutral draft `data` value
   and supplies all selected values through `scope.selectedValues`.
2. Its bulk `onChange` resolves a value or functional updater against the
   draft, then calls `table.updateCells(rowIds, columnId, finalValue)` once.
3. A `popover` editor uses the existing header-style icon button as trigger.
   An `inline` editor renders directly in the bar.

This intentionally does not seed a bulk editor from an arbitrary selected row.
Editors that need selection semantics can inspect the explicitly supplied
values; other editors continue to use the neutral draft value.

## Built-in Editor Behavior

| Plugin family | Value renderer | Editor result |
| --- | --- | --- |
| text, email, phone, URL | Existing text/link display | Existing input content in a popover |
| number | Existing formatted number display | Existing input content in a popover, retaining number normalization |
| select, multi-select | Existing option-tag display | Existing `SelectMenu` in a popover; bulk overwrites with one resolved set |
| date | Existing date display | Existing `DateTimePicker` in a popover |
| checkbox | Pure checked/unchecked visual | Inline checkbox control |
| title | Existing layout-specific value | Editor remains available to normal cells, but `disableBulkEdit` stays true |
| created time, last edited time | Existing value | No editor and `disableBulkEdit: true` |

The inline checkbox editor receives the same props in both scopes. In a cell it
toggles the actual boolean value. In bulk it computes state from
`scope.selectedValues`:

- all selected values are `true`: show checked and write `false` on click;
- all selected values are `false`: show unchecked and write `true` on click;
- values are mixed: show indeterminate and write `true` on click.

There is no checked/unchecked menu and no checkbox-specific branch in
`BulkEditColumn`.

## Popover Ownership

Use the detached handle pattern from
[`popover.stories.tsx`](../../../apps/storybook/src/stories/ui/popover.stories.tsx)
for the bulk bar only:

- `BulkEditBar` creates one typed `Popover` handle.
- Each popover editor column renders a `PopoverTrigger` with the resolved
  editor payload.
- One `Popover` consumes that payload and renders the corresponding content.
- Inline editors do not create a trigger or popover.

This reduces repeated root/popover boilerplate while retaining the current bulk
popover's `w-62` surface. Normal cells keep local popovers because their
anchors and surfaces differ by layout and plugin (notably select positioning).
Their existing class names and placement options travel through the editor
result unchanged.

## Layout Migration

`TableRowCell` and `TableCell` currently duplicate the direct `renderCell`
call. Migrate both to the shared composition host, then verify every consumer:

| Surface | Required outcome |
| --- | --- |
| table | Keeps table trigger, copy affordances, and editor behavior |
| list | Keeps empty-value visibility and list interaction behavior |
| board properties | Keeps card property visibility and popover behavior |
| timeline | Keeps title/date and other property presentation rules |
| row view | Keeps explicit empty displays and editing behavior |
| board title | Stays in `BoardCard` with its current dedicated editor |

Value renderers remain responsible for existing layout-specific value rules,
such as hiding an empty text/date value in board or list while showing `Empty`
in row view. The generic host must not invent a substitute trigger for a value
renderer that returns nothing.

## Failure Handling and Invariants

- `BulkEditColumn` must safely omit a column without an editor and must never
  attempt to resolve an absent editor result.
- `disableBulkEdit` always wins over an available editor.
- A value and a functional updater both become one resolved final bulk value;
  no UI loop may call `updateCell` per row.
- Editor props continue to pass `disabled`, `onConfigChange`, config, and
  layout. Locked-table behavior remains enforced by the existing mutation
  path and control state.
- A detached-popover payload with no live editor content renders nothing rather
  than throwing; selection changes cannot cause a stale payload to update a
  different column.

## Verification

### Contract and regression coverage

- Typecheck proves that all factories, custom plugin fixtures, and examples
  implement `renderCellValue`; none use `renderCell`.
- Test a custom plugin with a popover editor: it appears in bulk and applies a
  shared value without changing generic bulk-edit code.
- Test eligibility for missing editor, `disableBulkEdit`, and both together.

### Editing coverage

- Cover shared editor resolution for text, number, select, multi-select, and
  date in cell and bulk scopes. Preserve number normalization and select's
  overwrite (not merge) semantics.
- Cover checkbox cell toggle plus bulk all-unchecked, all-checked, and mixed
  selections.
- Assert that popover bulk columns use the detached payload/trigger and that
  inline checkbox does not create a popover.
- Verify select and date configuration updates still flow through
  `onConfigChange`.

### Layout and end-to-end coverage

- Exercise table, list, board property, timeline, and row-view value and
  editor visibility rules, including empty values.
- Keep the existing board title test as a no-regression boundary.
- Preserve the existing bulk-edit browser journey and change its checkbox
  expectation from menu selection to direct toggle. Perform a manual visual
  pass for bulk-bar sizing/overflow and the existing cell popover placement.

Run the focused `@notion-kit/table-hook` and `@notion-kit/table-view` tests,
typechecks, and lints using the repository's Node 24.11.1/pnpm instructions.

## Success Criteria

- `BulkEditColumn` contains no plugin ID/type switch and imports no
  plugin-specific editor.
- One plugin registry definition controls the corresponding editor in cell and
  bulk scopes.
- Checkbox uses a mixed-aware direct toggle in bulk and remains a direct toggle
  in a single cell.
- All listed layouts preserve their current visual and interaction contracts.
- The legacy `renderCell` contract is absent from source, docs, fixtures, and
  tests.
