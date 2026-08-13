# Table-view plugin responsibilities

The canonical plugin contract and built-in data semantics live in
[`@notion-kit/table-hook/plugins`](../../table-hook/docs/plugins.md). This page
documents only the UI boundary.

## What a table-view plugin provides

Each exported factory is a no-argument configured wrapper around the matching
headless factory. The wrapper supplies the current icon and React callbacks:

- `renderCell` for the visible cell;
- `renderConfigMenu` for property configuration, when supported;
- `renderGroupingValue` for grouped labels, when supported;
- the default and property icons used by the existing property UI.

The wrapper must not reimplement conversion, sorting, grouping, counting,
method IDs, or compatibility fallbacks. It may adapt component props and wire
UI-only callbacks before invoking the headless descriptor.

## UI ownership by source area

| Area                                                                       | Responsibility                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/plugins/<type>/`                                                      | Cell renderers, editors, config menus, picker controls, grouping-value components, and configured wrappers.                                 |
| `src/menus/`                                                               | Render plugin-provided method and grouping options; persist the selected view action. Generic menus must not branch on built-in plugin IDs. |
| `src/table-footer/`                                                        | Render the resolved calculation result supplied by table-hook.                                                                              |
| `src/table-body/`, `src/table-header/`                                     | Render rows, groups, headers, resize, and drag interaction surfaces.                                                                        |
| `src/list-view/`, `src/board-view/`, `src/timeline-view/`, `src/row-view/` | Layout-specific rendering and interaction behavior.                                                                                         |

## Extension rule

A custom plugin can be placed in the same `plugins` array as built-in wrappers.
If it registers a capability in `table-hook`, the generic menus should discover
it without a new table-view type switch. New UI is needed only when the custom
plugin requires a renderer or configuration surface.

## Related audits

See the [table-view testing audit](./testing/README.md) for the component and
interaction contracts that protect this boundary.
