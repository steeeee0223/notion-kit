# Table-view and table-hook feature map

This map describes capabilities implemented by `packages/table-view/src` and `packages/table-hook/src`. Product components, hook features, and plugin contracts define its scope. Test names and fixture scenarios do not define a feature.

## Read the product before choosing a drive

| Feature                                                   | User-facing capability                                                                                        | Primary source owners                                                                                                                                                                                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Edit values and own resources](editing-and-resources.md) | Typed editors, commit/cancel, compact editing, row details, independent controlled resources, plugin adapters | [renderers](../../../../packages/table-view/src/plugins/renderers.tsx), [useTableView](../../../../packages/table-hook/src/table-contexts/use-table-view.tsx)                                                                                 |
| [Manage properties](properties.md)                        | Metadata, types, configuration, visibility/order/width, create/duplicate/delete/restore                       | [property menus](../../../../packages/table-view/src/menus/prop-menu.tsx), [column actions](../../../../packages/table-hook/src/features/columns-info.ts)                                                                                     |
| [Find and organize rows](finding-and-organizing.md)       | Search, nested typed filters, ordered sorting, grouping methods, group order, calculations                    | [filter editor](../../../../packages/table-view/src/menus/filter-menu/filter-group-editor.tsx), [group editor](../../../../packages/table-view/src/menus/edit-group-menu.tsx), [hook methods](../../../../packages/table-hook/src/methods.ts) |
| [Select and act on rows](selection-and-row-actions.md)    | Cell ranges, row/group selection, bulk edits, row operations and movement                                     | [cell selection](../../../../packages/table-view/src/table-contexts/cell-selection-provider.tsx), [row actions](../../../../packages/table-hook/src/features/row-actions.ts)                                                                  |
| [Change layouts and open rows](layouts-and-row-views.md)  | Table/List/Board/Timeline, date tracks, peek modes, navigation, lock                                          | [layout menu](../../../../packages/table-view/src/menus/layout-menu.tsx), [view state](../../../../packages/table-hook/src/features/menu.ts)                                                                                                  |
| [Plugin behavior across table views](plugin-behaviors.md) | All 12 built-ins: value semantics, sorting/grouping, filters, calculations, configuration and layout effects  | [hook plugins](../../../../packages/table-hook/src/plugins/index.ts), [method resolution](../../../../packages/table-hook/src/methods.ts), [UI plugin pairs](../../../../packages/table-view/src/plugins/index.ts)                            |

Each feature file separates product capabilities and entry points from one reproducible browser recipe. Related capabilities link to their owning feature to avoid duplicate definitions.

For changes to a property type, start with the plugin matrix and follow its links to the affected interaction features. A generic sorting/grouping journey does not establish the distinct behavior of every plugin.

## Execution surface

Follow [Launch and Doctor](../SKILL.md). The built-package app is an execution host: `/table-view/controlled` accepts resource proposals; `/table-view/uncontrolled` uses defaults. Both initialize Alpha/Empty/Omega with scores 10/empty/90 and statuses Active/empty/Done. These records and diagnostic panels are fixture data, not library features.

Reuse matching cases in `apps/e2e/tests`, or drive the listed controls with a browser. Existing page objects provide reusable locators and actions. Existing E2E specs supply execution and evidence; a missing test is not evidence that a product capability is missing. Keep the skill's map and recipes independent of the suite's test inventory.

## Coverage and evidence

Exercise every feature file at least once during maintenance. For a specific change, cover every affected user entry point, including alternate menus and layouts. One representative journey does not prove every sub-feature in its file.

Record the feature, entry point, action, visible result, and resource effect. Preserve traces, screenshots, accessibility snapshots, and read-only diagnostics. Report product failures separately from map/harness drift. Do not substitute a fixture scenario button or direct hook setter for the user action under verification.

The default fixture cannot demonstrate a rejecting controlled owner, custom plugin registration, or Full page without `getRowUrl`. Those are real consumer contracts. Verify them in a consumer configured for that contract; record the unmet fixture prerequisite instead of deleting them from the map or treating unit tests as browser proof.

## Surfaces without implemented behavior

[Toolbar](../../../../packages/table-view/src/tools/toolbar.tsx) renders **New**, **Create and view automations**, and **Open as full page** without action handlers. They are not the working row-creation or row-opening entries. Calendar/Gallery/Chart are disabled in Layout. Row-menu Edit property, Move to, and Comment are not implemented; pointer row movement is implemented. Keep these distinctions when reconciling new source changes.
