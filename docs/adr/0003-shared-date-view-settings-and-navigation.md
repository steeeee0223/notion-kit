# Shared date view settings and navigation

Calendar and Timeline show the same table dates. Separate persisted settings
would let the views select different properties or lose the user's current
period when the layout changes.

`TableViewState.dateView` replaces `TableViewState.timeline` and stores
`datePropertyId` and `range`. The defaults are `null` and `monthly`.
`setDateViewDateProperty` and `setDateViewRange` replace the Timeline-specific
methods. Their actions use `view.date_view_property.change` and
`view.date_view_range.change`. This is a direct API rename, with no legacy
alias or second settings object to synchronize. Consumers must migrate
persisted state and controlled resource handlers as described in the
[Table View migration guide](../../apps/docs/content/docs/blocks/table-view/index.mdx#migrate-timeline-settings).

Calendar supports `daily`, `weekly`, and `monthly`. Timeline supports `daily`,
`monthly`, and `quarterly`. `setTableLayout` preserves supported ranges and
replaces unsupported ranges with `monthly` in the same view update.
The layout action records that fallback. Switching back retains `monthly`
rather than restoring a separate range for each view. Controlled and default
view inputs also resolve to a supported range without an effect that emits
correction callbacks. Other layouts leave the date settings unchanged.

The viewed date has a different lifetime from these settings.
`DateViewNavigationProvider` stores `anchorDate` within the mounted table
wrapper, so date navigation does not call `onViewChange`. The date survives
layout changes, including visits to Table or Board, and resets on remount.
Both standalone providers expose `anchorDate`, `defaultAnchorDate`, and
`onAnchorDateChange`; the table adapters use the controlled form.

Timeline reports the visible center date after excluding its sidebar.
Its `startDate` and `endDate` still bound the time axis. Calendar shows the
period containing `anchorDate`. Persisting the viewed date would turn scroll
events into resource updates, while storing it inside each layout would
discard navigation on every layout switch.
