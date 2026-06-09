# Issues

issues recording for current task

1. combobox-multiple-inline.tsx -> current filtering behavior is NOT same as combobox-multiple-floating.tsx
2. add-members.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx), also avoid using `useFilter`
3. select-menu.tsx -> can NOT use keyboard arrows to select option, since the option item is implement in a different way...
4. select-menu.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx)
5.  menu issues!
    1. content or portal z-index wrong! (e.g. in sidebar-presets, table-view)
6.  in table-view
    1. many menus are still not working as expected (e.g. popover + menu primitives). they can probably changed into dropdown-menu
    2. sort-menu.tsx -> the SelectContent's in the SortRule are not visible, not sure if they are caused by issue 12.1
7. fix unittest errors!