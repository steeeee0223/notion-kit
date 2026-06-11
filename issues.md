# Issues

issues recording for current task

1. combobox-multiple-inline.tsx -> current filtering behavior is NOT same as combobox-multiple-floating.tsx
2. add-members.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx), also avoid using `useFilter`
3. select-menu.tsx -> can NOT use keyboard arrows to select option, since the option item is implement in a different way...
4. select-menu.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx)
5. menu issues!
   1. content or portal z-index wrong! (e.g. in sidebar-presets, table-view)
      - root cause: table-view was mixing Popover, visual-only MenuItem rows, DropdownMenu, Autocomplete, and Select portals in the same menu flow. Nested/competing floating roots each applied their own portal/focus/dismiss semantics, so child content could render outside the active stack or be treated as outside interaction.
6. in table-view
   1. many menus are still not working as expected (e.g. popover + menu primitives). they can probably changed into dropdown-menu
   2. sort-menu.tsx -> the SelectContent's in the SortRule are not visible.
      - root cause: the sort toolbar Popover contained a second Popover for "Add sort" and Select portals inside non-dropdown MenuItem rows. Click/type events from inline controls bubbled into the parent menu surface, while nested floating roots competed for outside-click and focus handling. Migrating the parent shell and internal actions to DropdownMenu, rendering "Add sort" inline, and stopping propagation from embedded controls keeps the SelectContent in the active dropdown interaction tree.
7. fix unittest errors!

## Existing issues

1. press "Remove grouping" does not clear the `state.groupingState.groupValues`
