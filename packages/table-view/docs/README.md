# `@notion-kit/table-view` documentation

`table-view` is the React presentation layer for the headless table engine. It
assembles configured plugins, renders cells and controls, and turns table state
into table, list, board, timeline, and row-view interactions.

## Responsibility

`table-view` owns:

- no-argument wrappers that inject icons and React renderers into
  `table-hook/plugins` factories;
- cell renderers, config menus, selection menus, date pickers, and grouping-value
  components;
- generic menus that discover operations from plugin capabilities;
- table/list/board/timeline/row-view layout and interaction behavior;
- UI-only drag, keyboard, popover, and navigation behavior;
- component-object test harnesses and observable UI contracts.

`table-view` does not define the meaning of a property value, execute headless
sorting/grouping/counting semantics, or add built-in-plugin branches to generic
menus. Those responsibilities belong to `table-hook`.

## Documentation map

- [UI plugin wrappers and presentation boundaries](./plugins.md)
- [Testing audit index](./testing/README.md)
- [Headless plugin contracts](../../table-hook/docs/plugins.md)

When changing a UI behavior, update the relevant responsibility document and
testing audit page. If the change alters data semantics or method resolution,
document it in `table-hook` instead.
