# Table UI Plugin Registry Design

## Goal

Split plugin responsibilities into two registries with a one-way dependency:

- `@notion-kit/table-hook` owns data plugins: persisted defaults, conversion,
  empty semantics, sorting, grouping, counting, filtering, comparison, and
  configuration transfer.
- `@notion-kit/table-view` owns table UI plugins: property labels and icons,
  default layout metadata, cell and bulk-editor React trees, configuration and
  grouping React trees, and every surface-specific visual decision.

The cell rendering contract returns to the direct model: a table UI plugin's
`renderCell` and `renderBulkEditor` return `ReactNode`. A UI plugin owns the
complete DOM and interaction composition it needs, including a trigger,
popover, editor, empty state, and optional copy button. Shared table-view
components may reduce duplication, but are implementation details rather than
fields of a renderer-result protocol.

This replaces the presentation-registry and editor-result direction introduced
by PR #179. The previous cell-composition design remains historical context;
its `CellPresentation`, `CellEditorResult`, and value/editor split are not part
of the target architecture.

## Hard Constraints

- Table-hook's plugin, plugin-factory, and grouping-rendering contracts must
  not import React or expose `ReactNode`. This does not prohibit React hooks
  that are otherwise needed to implement the table-hook package.
- `CellPlugin` must not contain icons, display labels/descriptions, default
  property icons or widths, `renderCellValue`, `renderCellEditor`,
  `renderConfigMenu`, `renderGroupingValue`, or `disableBulkEdit`.
- A table UI plugin is a separate adapter keyed by the same stable plugin ID;
  it must not extend or duplicate a `CellPlugin` object.
- `renderCell` and `renderBulkEditor` return `ReactNode`; do not introduce a
  replacement discriminated result such as `CellEditorResult`.
- `CellPresentation`, `getCellPresentation`, and the mapping from a plugin ID
  to a presentation type are removed. Layout classes belong to the UI plugin
  that renders the relevant DOM.
- `surface` is a table-view type and is supplied only to table-view UI render
  props. It must not appear in table-hook types.
- `plugin.id` may be used only to resolve the matching UI adapter in the
  registry. Cell hosts, bulk edit, menus, and layouts must not branch on a
  built-in ID.
- Preserve current user-visible interaction and styling: cell activation,
  disabled state, copy affordances, popover placement/close policy, link
  safety, select option tooltips, title row actions, compact widths, and
  empty-value behavior.
- The built-in title behavior is implemented in the title UI plugin, not as a
  `Cell.Content` exception. Checkbox's direct toggle is implemented by its
  inline UI node, not by a host branch.
- Do not retain a legacy path: no compatibility adapter, overload, optional
  legacy renderer field, legacy registry input, or neutral rendering fallback
  may accept the old combined-plugin contract. Migrate built-ins, fixtures,
  documentation, and external-facing examples in the same change.
- This is an architectural refactor only. Existing visual output is a contract:
  do not introduce new visual variants, design tokens, or styling decisions.
  A class may move into a UI plugin/helper only when it preserves the current
  computed layout, sizing, spacing, color, hover, focus, and empty states.

## Target Registries

### Data registry: `@notion-kit/table-hook`

`CellPlugin<Key, Data, Config>` is a pure data contract. Its default payload
contains only persisted data/configuration. Built-in factories such as `text`,
`date`, and `select` take no UI renderer configuration and return only their
data capabilities.

```ts
interface CellPlugin<Key extends string, Data, Config> {
  id: Key;
  default: { data: Data; config: Config };
  fromValue(value: ComparableValue, config: Config): Data;
  toValue(data: Data, row: Row): ComparableValue;
  toGroupValue?(data: Data, row: Row): ComparableValue;
  toTextValue(data: Data, row: Row): string;
  isEmpty(data: Data): boolean;
  // sorting, grouping, counting, filtering, compare, transferConfig
}
```

`meta`, the property display name/description, React icons, default property
name/icon/width, and bulk-edit eligibility move to table-view. A data plugin
does not need to know whether it is rendered in a table, board, list, row view,
or any future UI.

Table-hook grouping exposes raw grouping data and the grouped column identity;
it no longer calls a renderer or returns `ReactNode`. Its existing default
string grouping conversion remains data-level. Table-view decides how to turn
the value into React content.

### UI registry: `@notion-kit/table-view`

Table-view defines UI types locally. `TableUiPluginFor<Plugin>` references a
data plugin only at the type level so its ID, data, and config remain aligned;
it does not inherit the data plugin's runtime members.

```ts
interface TableUiPluginFor<Plugin extends CellPlugin> {
  id: Plugin["id"];
  meta: {
    name: string;
    description: string;
    icon: ReactNode;
  };
  propertyDefaults: {
    name: string;
    icon: ReactNode;
    width?: number;
  };
  renderCell(props: TableUiCellProps<InferData<Plugin>, InferConfig<Plugin>>): ReactNode;
  renderBulkEditor?(props: TableUiBulkEditorProps<InferData<Plugin>, InferConfig<Plugin>>): ReactNode;
  renderGroupingValue(props: TableUiGroupingValueProps): ReactNode;
  renderConfigMenu?(props: TableUiConfigMenuProps<InferConfig<Plugin>>): ReactNode;
}
```

`TableUiCellProps` combines the current value/editor binding into one
table-view-only input. It includes the property metadata, row, data, config,
`textValue`, `surface`, wrapping and locked state, plus mutation callbacks.
`TableUiBulkEditorProps` includes bulk scope, selected values, data/config,
disabled state, and mutation callbacks. These types replace `CellValueProps`,
`CellEditorProps`, `CellEditorScope`, `CellEditorPopoverOptions`, and
`CellEditorResult` from table-hook.

The `textValue` input is calculated by the data plugin's `toTextValue` before
the UI call. This lets a UI plugin render a copy button without importing or
being coupled to its paired data-plugin implementation.

### Registry composition and validation

`TableView`/`TableViewWrapper` expose one explicit `plugins` pair with `data`
and `ui` members. This keeps registration discoverable and type-linked without
making an application carry two unrelated props. The built-in default is the
same paired shape. A custom property type used in table-view adds both entries
to that one pair; table-hook receives only the pair's data registry.

The table-view registry builder indexes UI plugins by ID and validates at
construction time that IDs are unique and that every supplied data plugin has
one UI adapter. A missing adapter is a configuration error. There is no legacy
input adapter, neutral renderer, or ID-specific rendering branch.

All UI consumers resolve a data plugin from the table, then resolve the UI
adapter once through the table-view registry. This ID lookup is the permitted
adapter boundary. The resolved adapter, rather than an ID, is passed to the
cell, bulk-edit, property-menu, type-menu, and grouping compositions.

## Direct Cell Rendering

`renderCell` returns the complete node. There is no central cell renderer that
interprets a popover/inline result, applies a presentation class map, or adds a
copy button.

```text
default column / direct surface consumer
  -> resolve data plugin and matching UI plugin
  -> bind row data, config, text value, lock state, and mutations
  -> uiPlugin.renderCell(props) -> ReactNode
```

A normal editable plugin can use a shared table-view `CellPopover` component
that owns open state and composes a `CellTrigger`, `Popover`, and editor. Its
value display can include a `CopyButton` when that plugin and surface require
one. The date UI can configure its shared popover helper not to close on every
change. A checkbox UI plugin returns an interactive checkbox directly. Title
can compose its table/list/timeline behavior and row actions inside its own UI
plugin. None of these arrangements are encoded in the registry interface.

`surface` enables the UI plugin to restore the prior per-surface behavior:

- compact list/board cells omit empty content where appropriate;
- row-view cells render their own empty placeholders;
- copy controls render on the same surfaces as before;
- compact width and trigger classes remain with the plugin's trigger DOM;
- option and property tooltip placement remains owned by the corresponding UI
  composition.

The outer table grid frame, hierarchy expander placement, and list/board
container remain layout components. They do not determine a plugin's visual
presentation or interaction behavior.

## Bulk, Menus, and Grouping

`renderBulkEditor` is optional. Its presence determines whether a property is
available in the bulk-edit bar, replacing `disableBulkEdit` and the
`renderCellEditor` presence check. It returns its complete UI node:

- a normal property may return an icon trigger plus popover/editor composition;
- checkbox may return an inline bulk checkbox;
- title omits the function and is therefore unavailable for bulk edit.

Configuration and grouping renderers stay direct `ReactNode` callbacks, but
move to `TableUiPlugin`. `PropMenu` resolves and invokes the UI adapter's
optional `renderConfigMenu`. Every UI adapter supplies `renderGroupingValue`;
adapters wanting the common output invoke table-view's `DefaultGroupingValue`
themselves. Grouped row and board compositions receive raw group data from
table-hook, resolve the adapter for the grouping column, and invoke that method
without a host fallback.

`TypesMenu`, edit-property controls, and default-property creation use UI
metadata and `propertyDefaults`. Existing persisted property icons continue to
override a UI adapter's default icon.

## Built-in UI Composition

The public interfaces stay small; code reuse stays local to table-view:

- text, email, phone, and URL share a text-like cell/popover implementation,
  while each UI plugin supplies its display behavior and link target handling;
- select and multi-select share option/config/editor helpers and pass their
  single/multiple behavior directly to them;
- date, created time, and last-edited time share date display/editor helpers;
- title and checkbox retain dedicated implementations because their interaction
  models differ materially;
- `CellTrigger`, `CellPopover`, copy controls, and tooltip helpers are shared
  table-view components, not renderer protocol fields.

These helpers are intentionally package-internal. The public custom-plugin DX
is one data plugin plus one UI plugin in the paired `plugins` input; consumers
do not implement presentation metadata, popover result objects, or adapter
layers. Do not introduce additional public registries, renderer abstractions,
or extensibility points in this refactor.

## Testing and Verification

Update table-hook unit tests and mocks so built-in factories are instantiated
without UI configuration and verify that no React-valued rendering contract is
exported from table-hook.

Update table-view tests and fixtures to register paired data/UI plugins.
Focused behavior coverage must verify:

- registry rejects duplicate or missing UI adapters;
- a custom paired plugin renders through the adapter without a host ID branch;
- text/link/date/number copy and empty behavior match current surfaces;
- checkbox toggles in cells and bulk edit through its inline UI implementation;
- title retains table/list/timeline behavior and remains absent from bulk edit;
- select option tooltips, config menus, and grouping labels resolve through UI
  adapters.

The regression review treats visual changes as failures. For each built-in
plugin/surface combination, compare the current branch's dimensions, classes,
visible controls, empty states, hover/focus states, and popover positions with
the pre-refactor behavior before accepting the implementation.

Run focused tests, typechecks, lint, and format checks for both packages. Then
manually verify table, list, board, row-view, and timeline with each built-in
property family.

## Out of Scope

- Changes to stored table data, filters, sorting, grouping algorithms, count
  semantics, or property persistence.
- New table layouts, cell selection, keyboard navigation, or accessibility
  behavior beyond preserving current behavior.
- Backward compatibility for callers that configure a table-hook plugin with
  React render callbacks.
