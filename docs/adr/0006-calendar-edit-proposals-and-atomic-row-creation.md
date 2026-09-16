# Calendar edit proposals and atomic row creation

Calendar supports both standalone event arrays and controlled table resources.
The data owner can accept, delay, or reject an edit. Persisting gesture
previews inside Calendar would let the display disagree with the owner's data.

`CalendarProvider` receives read-only events and keeps only temporary gesture
drafts. A valid drop calls `onEventChange` once with the event ID, complete
date values, and the reason: `move`, `resize-start`, `resize-end`, or `convert`.
Cancellation and invalid drops do not write. Changes to source events,
range, viewed date, or time zone invalidate the gesture. The draft clears
after completion.
The caller owns persistence, retries, and error messages.

Moving any visible segment moves the original event while preserving the
grabbed segment's day offset. Resize handles belong to the event's actual
boundaries, including its displayed end when no end is saved. Splits at day
or week boundaries do not create independent edits.

The table adapter commits a date gesture through one `table.updateCell`
call, preserving the cell ID and other value fields. A move between the
all-day area and the time grid changes dates and `includeTime` together.
All-day conversion preserves the occupied calendar days. Conversion to timed
events starts at the drop time and ends one hour later on the last occupied
day. Thus, a three-day event dropped at 10:00 ends at 11:00 on its third day.
Conversion does not retain hidden old times for a later reversal.

Creation uses `table.addRow({ initialValues })`, which returns the proposed
row ID and includes the initial Date value in one data resource update.
The adapter opens that row only after its ID appears in the owner's data.
A rejected proposal neither opens a missing row nor triggers another create
request. Creating an empty row followed by a cell update would expose partial
data and force a controlled owner to coordinate two proposals.

Missing callbacks disable their corresponding edits, and `readOnly` disables
all event mutations while preserving navigation and opening. Locked tables
also disable persisted date setting changes. New rows keep normal defaults
for other properties, so a new event can fall outside the current filters.
This accepts that visibility trade-off rather than silently changing data
to make each new row match the current view.
