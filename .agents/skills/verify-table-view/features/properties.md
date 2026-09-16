# Manage properties

Users change the schema shared by their rows: metadata, type, plugin configuration, presentation, and lifecycle. Row values retain property identity across supported changes.

## Sub-features

- `property-create`: create from registered types, search or create a named text property, and insert beside a column. New cells start with plugin defaults. Title creation/conversion is disabled in the type menu. [Types menu](../../../../packages/table-view/src/menus/types-menu.tsx), [column actions](../../../../packages/table-hook/src/features/columns-info.ts).
- `property-metadata`: edit a unique name, description, and icon; duplicate names show validation. Icons support selection/removal and local file upload. [Metadata editor](../../../../packages/table-view/src/common/prop-meta.tsx).
- `property-lifecycle`: duplicate schema/configuration to a new ID immediately to the right, with default cell values; soft-delete preserves identity/data; restore revives it; permanent deletion removes the property and all its row values. [Column actions](../../../../packages/table-hook/src/features/columns-info.ts), [deleted properties](../../../../packages/table-view/src/menus/deleted-props-menu.tsx).
- `property-type`: retain the property ID while converting its configuration and every row value through the destination plugin's conversion methods. Verify converted data as well as the type label. [Column conversion](../../../../packages/table-hook/src/features/columns-info.ts).
- `property-presentation`: search property list, hide/show individually or all, reorder list/headers, resize, wrap/unwrap, and freeze/unfreeze through a column. Hide all keeps the title. [Property list](../../../../packages/table-view/src/menus/props-menu.tsx), [header sizing](../../../../packages/table-view/src/table-header/table-header-cell.tsx), [freezing](../../../../packages/table-hook/src/features/freezing.ts).
- `number-config`: Number/commas/Percent/Currency, decimal places, Number/Bar/Ring, meter color/divisor/show-number. Formatting changes presentation rather than the stored numeric value. [Number configuration](../../../../packages/table-view/src/plugins/number/number-config-menu/number-config-menu.tsx).
- `option-config`: add, rename, describe, recolor, delete, reorder, and sort options manually/alphabetically/reverse. Rename/delete updates referring row values, including multi-select arrays. Duplicate names are rejected. [Option configuration](../../../../packages/table-view/src/plugins/select/select-config-menu/select-config-menu.tsx), [option reducer](../../../../packages/table-view/src/plugins/select/select-config-reducer.ts).
- `date-title-config`: date/time formats and title Show page icon; date cells also expose timezone. [Date configuration](../../../../packages/table-view/src/plugins/date/date-config-menu.tsx), [title configuration](../../../../packages/table-view/src/plugins/title/title-config.tsx).

## How to get to it (user POV)

- Click a Table column header for metadata, plugin configuration, Change type, presentation, insert, duplicate, and delete. Header filter/sort/group/calculation shortcuts belong to [finding and organizing](finding-and-organizing.md).
- Choose **Settings → Edit properties** for search, visibility, **Hide all/Show all**, drag order, **New property**, and **Deleted properties**. Select a property to edit it.
- Use the header's trailing **+** or **…** buttons as alternate create/property-list entries. They currently lack accessible names; scope them to the header action area when driving. [Header entries](../../../../packages/table-view/src/table-header/table-header-row.tsx).
- In an open row, click a non-title property label. Its menu offers metadata, configuration, type, duplicate, and delete; table-only presentation/organization actions are omitted. [Row entry](../../../../packages/table-view/src/row-view/view-props.tsx), [menu boundary](../../../../packages/table-view/src/menus/prop-menu.tsx).
- Select/multi-select option editors are reachable from both property configuration and an opened cell's option menu.

## Driving it with Playwright

Preconditions: healthy controlled fixture; Alpha Score is stored as `"10"`; unlocked Table layout.

1. `table.openHeader("Score")`; hover **Edit property → Number format**, then choose the **Currency** radio item. Dismiss menus. Require Alpha to display currency while its stored value remains `"10"`.
2. Reopen Score's **Edit property** submenu and click **Bar**. Require a visible meter, property config `showAs: "bar"`, and a `properties.update` event targeting the same `score` ID.
3. Open Alpha in row detail; click its **Score** property label, hover **Edit property**, and require **Bar** to remain selected. This proves a second configuration entry using the shared property.
4. Capture the real menu action and UI/resource result. Do not use **Apply plugin configuration scenario** as evidence of these controls.

For lifecycle changes, create a temporary property through New property, edit metadata, duplicate it, then soft-delete/restore and permanently delete the temporary duplicate. Compare property IDs and every affected row value at each step. A duplicate must have default cells, not cloned source values; permanent deletion must remove the values as well as the header.

## Gotchas

- Settings' individual Edit property screen does not yet render plugin configuration. Use a header or row-property menu for that capability. [Current edit screen](../../../../packages/table-view/src/menus/edit-prop-menu.tsx).
- Scope display buttons to the **Edit property** menu. The meter contributes accessible text, so match `/Bar$/` rather than the exact name `Bar`. Wait for dismissed menus to unmount before reopening them.
- Property duplication and row duplication have different value semantics: property duplication starts default cells; row duplication copies row values.
- Title restrictions are specific UI guards. Check the actual entry point instead of assuming every low-level hook API enforces them.
- Lock verification must include alternate entries and resize handles, not just the disabled header button. Treat a successful locked mutation as a product issue to report.
- Icon upload currently stores a browser blob URL; it does not upload to durable storage.
