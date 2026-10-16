---
"@notion-kit/ui": major
"@notion-kit/table-view": major
"@notion-kit/registry": patch
---

Use native Base UI filtering for table menus, including row context menus, while retaining existing menu styling.

AutocompleteInput and CommandInput include native clearing. Remove search, clear, and onCancel props from callers; the standalone AutocompleteClear export is removed. Use root onValueChange for application query effects. AutocompleteInputProps retains field variant and wrapper styling options.

Table-view menu hosts must provide the filter root. PropsMenu and TypesMenu receive their application's query explicitly; use TableViewMenuRoot to host settings pages and pass its query to TableViewMenu. RowActionMenu shares its content between filtered dropdown and context roots.
