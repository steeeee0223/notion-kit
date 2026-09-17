# Separate Calendar and Timeline layouts

Calendar needs month rows, all-day lanes, and a vertical time grid. Timeline
uses a horizontal time axis. A shared layout engine would couple different
coordinate systems and require a wider Timeline rewrite.

Calendar therefore has its own layout and interaction code in
`packages/ui/src/calendar/`, exposed through `@notion-kit/ui/calendar`.
It accepts `CalendarEventData` and callbacks without depending on
`table-hook` or `table-view`. The table adapter owns Date property selection,
row conversion, persistence, and row opening.

The public API follows Timeline's composition pattern: a provider, content,
toolbars, and event parts. `CalendarMonth` handles month rows, while
`CalendarTimeGrid` serves both Week and Day. Layout code positions event
segments before passing them to `renderEvent`. Custom cards compose
`CalendarEvent.Root`, `CalendarEvent.Item`, and `CalendarEvent.Resize` to keep
the existing interactions. A segment represents part of one event, not a
separate stored event.

Calendar and Timeline share presentation controls from
`packages/ui/src/date-view/`. These controls accept values and callbacks
without reading either view's context or scroll container. They remain
internal modules. Calendar and Timeline retain their own public controls,
and the existing `Calendar` primitive remains a date picker.

Calendar uses one vertical scroll container. Month rows and all-day lanes
grow to show their events, and timed overlaps use adjacent columns.
This avoids nested scrolling and hidden events, at the cost of taller
calendars when many events share a period.

Separate engines leave some date logic in each view, but keep layout changes
independent. A universal engine would save less code than its coordinate
and interaction branches would add. The
[Calendar documentation](../../apps/docs/content/docs/blocks/calendar.mdx)
describes the supported composition API.
