# Table Cell Composition Design

## Goal

Refactor `@notion-kit/table-view` cell rendering into layout-owned compound
components. The refactor removes the current cell renderer contract in one
change, concentrates DOM composition and Tailwind classes in the layout layer,
and leaves the user-visible UI and interaction behavior unchanged.

The result must leave a clear future seam for cell selection and keyboard
navigation, but neither feature is part of this work.

## Hard Constraints

- Do not support the old plugin cell-renderer contract or provide an adapter
  for it. Every table-view plugin moves to the new contract in this change.
- Do not change any user-observable behavior: click activation, Enter/Space
  activation, tab order, popover lifecycle, inline editor behavior, row-open
  affordances, row drag-and-drop, and disabled behavior must remain as they
  are today.
- Do not change UI styling. The refactor may relocate class ownership, but the
  resulting layouts, widths, hover states, tooltips, and visual states must be
  equivalent.
- Do not add or modify unit tests and do not use TDD for this work. UI
  verification is manual through the new Storybook story.

## Current Problem

`TableRowCell` and `TableCell` independently resolve the row property,
column information, plugin, lock state, and mutation callbacks before each
instantiates `CellEditorHost`. Plugins then render `CellTrigger` themselves.
Consequently the plugin owns trigger classes, width type, tooltip props, and
the host-provided click callback in addition to its actual content.

`CellTrigger` currently also owns `TooltipPreset`. This puts a layout concern
inside a reusable interaction control even though only board and list cells
need property-description tooltips.

## Target Composition

`defaultColumn.cell` becomes the table-layout composition root. It receives
the complete TanStack cell context, resolves the active layout and the cell
presentation, then chooses the relevant compound frame.

```text
defaultColumn.cell(context)
  -> resolveCellPresentation(plugin.id, surface, wrapped)
  -> Cell.Root(cell, table, surface, presentation)
       table: Cell.TableFrame > Cell.Content
       list/board: Cell.Tooltip (TooltipPreset) > Cell.CompactFrame > Cell.Content

Cell.Content
  -> resolve cell data/config/mutation binding
  -> render plugin display/editor content into the trigger supplied by the
     parent composition
```

`Cell.Tooltip` is implemented with `TooltipPreset` and must wrap
`Cell.CompactFrame`, not `Cell.Trigger`. This makes the compact layout the
tooltip trigger and keeps tooltip assembly explicitly in the list/board branch.
Table, row-view, and timeline composition do not mount that tooltip slot.

### Compound Responsibilities

| Component | Owns | Does not own |
| --- | --- | --- |
| `Cell.Root` | Complete `CellInstance`, table reader, surface, resolved presentation context, and the future interaction seam | CSS decisions, tooltip rendering, selection, keyboard handlers |
| `Cell.TableFrame` | Existing table outer DOM: width, border, hierarchy expander placement, and overflow | Plugin data/editor logic or tooltip |
| `Cell.CompactFrame` | Existing list/board placement and compact sizing DOM | Plugin data/editor logic or tooltip content |
| `Cell.Content` | Data/config binding, disabled/mutation callbacks, and invoking the new plugin display/editor slots | Choosing Tailwind classes, width type, or tooltip |
| `Cell.Trigger` | The exact existing trigger semantics and DOM behavior | Choosing its own classes or wrapping a tooltip |
| `Cell.Tooltip` | Adapting property name/description to `TooltipPreset` | Deciding whether a layout gets a tooltip |

`Cell.Root` deliberately retains the complete `CellInstance`. A later,
separate selection/keyboard change can add a table-only interaction slot here
without threading identity through plugins. This change must not attach focus,
selection, pointer, or keyboard handlers.

## Presentation Registry

`packages/table-view/src/plugins/utils.tsx` becomes the table-view presentation
registry in addition to its existing grouping helper. It uses `cva` from
`@notion-kit/cn`; do not introduce `tailwind-variants`.

The registry exports a resolver such as:

```ts
getCellPresentation({ pluginId, surface, wrapped }): CellPresentation
```

`CellPresentation` is an internal UI descriptor containing frame, trigger,
group, and compact-width class names. It maps built-in semantic plugin IDs to
the exact current Tailwind output:

- text/title: text presentation;
- number: number presentation;
- select/multi-select: select presentation;
- email/phone/url: link presentation;
- date variants: date presentation;
- checkbox: checkbox presentation;
- unknown plugin IDs: current neutral/base presentation.

The `cva` variants encode surface (`table`, `list`, `board`, `row-view`, and
timeline where rendered), wrapping, and semantic presentation type. Width
classes apply only to compact surfaces, exactly as the current `CellTrigger`
does. Group names used by copy-button hover styles are also resolved here, so
trigger class ownership cannot drift back into a plugin.

Plugins may describe content semantics through their registered ID, but never
pass raw trigger or width classes to the composition layer.

## Breaking Plugin Interface

The existing `CellValueProps` and `renderCellValue` symbol names are retained,
but their old contract shape is replaced rather than adapted. There is no
overload, compatibility prop, or legacy rendering branch. In particular, the
new display slot must not receive `onClick` or `tooltip`, and it must not
return a `CellTrigger`.

The following is the exact interface delta. Unmarked lines retain their
existing name and shape; `+` and `-` lines are the only contract changes.
Neither value nor editor props receive a surface/layout value.

```diff
+type CellEditorScope<Data> =
+  | { kind: "cell"; row: Row }
+  | { kind: "bulk"; rowIds: string[]; selectedValues: Data[] };

interface CellValueProps<Data, Config> {
  propId: string;
  row: Row;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
-  layout?: LayoutType | "row-view";
-  tooltip?: { title: string; description?: string };
-  onClick?: () => void;
}

interface CellEditorProps<Data, Config> {
  propId: string;
  data: Data;
  config: Config;
  wrapped?: boolean;
  disabled?: boolean;
-  layout?: LayoutType | "row-view";
-  tooltip?: { title: string; description?: string };
  onChange: OnChangeFn<Data>;
  onCancel?: () => void;
  onConfigChange?: OnChangeFn<Config>;
-  scope:
-    | { kind: "cell"; row: Row }
-    | { kind: "bulk"; rowIds: string[]; selectedValues: Data[] };
+  scope: CellEditorScope<Data>;
}

interface CellPlugin<Key, Data, Config> {
-  renderCellValue: (props: CellValueProps<Data, Config>) => ReactNode; // previous props shape
+  renderCellValue: (props: CellValueProps<Data, Config>) => ReactNode; // revised props shape
  renderCellEditor?: (props: CellEditorProps<Data, Config>) => CellEditorResult;
}
```

`Cell.Content` applies the resolved `CellPresentation` and composes the
existing trigger around plugin content. This preserves the current activation
path while removing presentation decisions from the plugin API.

### Surface Policy Stays In Composition

`surface` is an internal `Cell.Root` and presentation-registry concern, not a
plugin prop. `Cell.TableFrame`, `Cell.CompactFrame`, and `Cell.Tooltip` decide
the layout-specific DOM, trigger classes, compact widths, property tooltip,
copy-button placement, and empty-value fallback before or around the
layout-neutral plugin content.

`renderCellValue` returns only the value content (or `null` when there is no
content). The composition applies the existing per-surface policy: table keeps
its trigger for an empty value, compact list/board surfaces omit empty content,
and row-view chooses its existing empty fallback where applicable. The
presentation registry contains any built-in exception required to preserve that
current output; it does not pass the surface back to a plugin.

The current title table/list split moves into title slots owned by
`Cell.TableFrame` and `Cell.CompactFrame`. Those slots compose the existing
layout-neutral title value/editor primitives and row-open affordance without
passing a surface argument into the title plugin. Checkbox's table padding and
all other editor styling similarly come from the resolved presentation.

The current inline exceptions remain behaviorally identical:

- checkbox continues to toggle through its current inline-editor interaction;
- title continues to use its current table/list editor and row-open affordance;
- value-only plugins remain readable and do not accidentally become editable.

They are migrated to the new slots directly; no legacy rendering branch is
retained.

## Composition by Surface

| Surface | Composition | Tooltip |
| --- | --- | --- |
| table | `Cell.Root > Cell.TableFrame > Cell.Content` | none |
| list | `Cell.Root > Cell.Tooltip > Cell.CompactFrame > Cell.Content` | property name and description |
| board | `Cell.Root > Cell.Tooltip > Cell.CompactFrame > Cell.Content` | property name and description |
| row-view | `Cell.Root > row-view frame > Cell.Content` | none |
| timeline | Existing timeline placement with `Cell.Root`/`Cell.Content` where it uses normal cell rendering | none |

Direct `TableCell` consumers in row-view and timeline must use the same
compound API but retain their existing surface-specific placement. This avoids
forcing table-grid semantics onto non-grid layouts.

## Storybook Manual Verification

Add `apps/storybook/src/stories/collections/table-view/cell-composition.stories.tsx`.
It is a pure composition demo: local demo content and local demo editors only,
with no real table data or production plugin behavior required.

The story demonstrates:

- table, list, board, and row-view frames;
- compact width variants for text, number, select, link, date, and checkbox;
- board/list property tooltip wrapping;
- display-only, popover-editor, and inline-editor composition;
- long/wrapped content and copy-button hover grouping.

Manual acceptance is that each demo has the same visual result and interaction
semantics as its corresponding current cell. No unit test files are changed.

## Migration Order

1. Introduce the `cva`-based presentation registry and compound components.
2. Replace the table-hook/table-view renderer types in one breaking change.
3. Migrate all built-in plugins to content/editor slots, preserving their DOM
   output and event semantics.
4. Assemble table/list/board composition in `defaultColumn`; migrate direct
   row-view and timeline consumers to the same root/content API.
5. Add the pure Storybook composition demo and manually inspect all surfaces.

## Out of Scope

- Cell selection UI, selection state consumption, drag range selection, and
  keyboard navigation.
- Changes to focus ownership, roving tabindex, ARIA grid behavior, or editor
  activation policy.
- User-visible styling or interaction changes.
- Unit-test additions, unit-test edits, and TDD.
