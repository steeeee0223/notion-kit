# Issues

issues recording for current task

1. [solved] default-teamspace.tsx -> combobox-empty is not showing
2. [solved] default-teamspace.tsx: the selected chips displayed at weird position. see combobox-multiple-floating.tsx for example
3. [wip] combobox-multiple-inline.tsx -> current filtering behavior is NOT same as combobox-multiple-floating.tsx
4. [wip] add-members.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx), also avoid using `useFilter`
5. [solved] add-members.tsx -> Notion fully updates its style...rewrite it...
6. select-menu.tsx -> can NOT use keyboard arrows to select option, since the option item is implement in a different way...
7. select-menu.tsx -> state needs to be refactored to fit better with `base-ui`'s usage (or see combobox-multiple-floating.tsx)
8. [solved] dropdown-menu.mdx -> the prop is not updated
9. select -
   1. [solved] item check indicator positioned wrong!
   2. [solved] SelectItem should wrapped in SelectGroup!
   3. [solved] Select content weird layout...
10. ~~command-item rendered with menu-item becomes DISABLED!!!~~
11. [solved] separators in menu are all with height 0!
12. menu issues!
    1. content or portal z-index wrong!
13. in table-view
    1. many menus are still not working as expected (e.g. popover + menu primitives). they can probably changed into dropdown-menu
    2. sort-menu.tsx -> the SelectContent's in the SortRule are not visible, not sure if they are caused by issue 12.1
