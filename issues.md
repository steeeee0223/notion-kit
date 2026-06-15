# Issues

issues recording for current task

1. combobox-multiple-inline.tsx -> current filtering behavior is NOT same as combobox-multiple-floating.tsx
2. add-members.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx), also avoid using `useFilter`
3. menu issues!
   1. content or portal z-index wrong! (e.g. in sidebar-presets, table-view)
      - root cause: table-view was mixing Popover, visual-only MenuItem rows, DropdownMenu, Autocomplete, and Select portals in the same menu flow. Nested/competing floating roots each applied their own portal/focus/dismiss semantics, so child content could render outside the active stack or be treated as outside interaction.
4. [x] select-preset: remove this!
   1. [x] first migration
   2. [x] to fix: settings-panel modals
5. [ ] Some select in dialog may occur z-index issue, since dialog is NOT yet migrated to base-ui

## Table view menus

1. [x] layout-menu: use dropdown-menu
   1. [x] select-group-menu
   2. [x] edit-group-menu
   3. [x] sort-menu: use dropdown-menu
2. [x] row-action-menu: use popover + autocomplete
3. [x] plugins
   1. [x] date-config-menu: use dropdown-menu
      1. caveat: the date/time-format-menu are reused else where, so they are not behave as proper submenus
   2. [x] number-config-menu: use dropdown-menu
   3. [x] select-config-menu: use dropdown-menu
4. [x] calc-menu: use dropdown-menu
5. [x] types-menu
6. [x] prop-menu
7. [x] props-menu
8. [x] edit-prop-menu
9. [ ] unittests: needs to rewrite the selectors!

## Upgrade dnd

1. [ ] Upgrade dnd
2. [ ] Add to primitive

## Existing issues

1. press "Remove grouping" does not clear the `state.groupingState.groupValues`
