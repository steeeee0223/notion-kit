# Calendar event intervals and time zones

Table Date values use an inclusive end date for all-day events. Calendar
also handles timed events, midnight boundaries, and events split across
days. Mixing inclusive and exclusive ends inside layout code would make
each overlap and segment calculation depend on the source format.

`CalendarEventData` therefore uses millisecond timestamps with an exclusive
`endAt`. The [table adapter](../../packages/table-view/src/calendar-view/calendar-adapter.ts)
converts an inclusive all-day end into the next local midnight and reverses
that conversion on write. A September 16–18 all-day value becomes an interval
from September 16 at midnight to September 19 at midnight. Timed values keep
their timestamps, so an event ending at midnight does not occupy the next
day. The existing `DateData` storage format remains unchanged.

`endAt: null` preserves the absence of a saved end. Layout uses one local day
for an all-day event or one hour for a timed event. Moving the event retains
the missing end; resizing can create one. Writing a display default back to
the data would erase the distinction between an explicit duration and a
date with no end.

The selected Date property's `config.tz` determines the table calendar's
time zone. Standalone Calendar defaults to the browser's time zone, and an
invalid zone falls back to UTC. Local day boundaries use calendar arithmetic
through `date-fns` and `@date-fns/tz`, because a day across a daylight saving
transition need not last 24 hours. Timed moves preserve elapsed duration,
while all-day moves preserve the number of calendar days.

The time grid uses local clock labels. New positions in a missing local
hour move forward to a valid time; repeated local times use the earlier
offset. Existing event timestamps remain authoritative. Zod validation
excludes invalid events individually, including an enabled end before the
start. Valid events with zero or short duration retain their data and receive
a minimum visual height. The 15-minute minimum applies to timed resize
results, not to existing data.

This keeps one interval convention inside Calendar at the cost of explicit
conversion at the table boundary. The adapter and date utilities own those
conversions so custom event renderers do not need storage or time zone rules.
