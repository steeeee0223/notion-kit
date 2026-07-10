# Issues

issues recording for current task

1. [ ] combobox-multiple-inline.tsx -> current filtering behavior is NOT same as combobox-multiple-floating.tsx
2. [x] migrate tooltip!
3. [x] update `contentVariants` to new design after migration

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
9. [x] unittests: needs to rewrite the selectors!

## Upgrade dnd

1. [x] Upgrade dnd
2. [x] Add to primitive
3. [ ] Fix usage
   1. [ ] selectable + dnd
   2. [ ] falling blocks + dnd

## Existing issues

1. press "Remove grouping" does not clear the `state.groupingState.groupValues`
