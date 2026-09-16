# Date property resolution and Calendar rows

Calendar must show scheduled rows without turning every existing row into
an event. Timeline already initializes dates from row metadata when it
creates a Date property. Sharing property selection must preserve that
behavior without applying it to Calendar.

Both adapters use
`packages/table-view/src/date-view/use-date-view-property.ts`. A usable
property has type `date` and is neither hidden nor deleted. The selected
`datePropertyId` takes priority; otherwise, the first usable property in
column order supplies dates. Created time and Last edited time properties
are not editable event sources.

If no usable property exists, an editable Calendar creates a uniquely named
Date property with empty values. Timeline retains its metadata initializer
when it creates a property. An existing Date property is reused without
filling empty cells, including one previously created by Calendar.
Creation and selection share an operation ID, and a pending initialization
does not issue duplicate requests while controlled resources await acceptance.

A locked table can display a fallback property without persisting the
selection. It neither creates a missing property nor edits dates. When no
usable property exists, the calendar shows an explanatory empty state.
This preserves navigation and row opening without turning a read into a
resource mutation.

Calendar converts real rows from the sorted row model after search and
filtering. It traverses grouped rows before expansion hides collapsed
groups, excluding group headers while keeping their matching rows visible.
Rows without valid dates remain in the data resource but do not appear as
events. Date gestures leave sorting and manual row order unchanged.

Requiring users to select or create a property before viewing Calendar would
avoid automatic initialization but interrupt the existing table workflow.
Copying Timeline's metadata initialization would instead invent scheduled
dates. Shared resolution with a separate initializer for each layout keeps
property behavior consistent while preserving the meaning of an empty date.
