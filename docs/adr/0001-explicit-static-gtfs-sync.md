# Explicit Static GTFS Sync

Routes and Stops perform read-only static feed status checks and cached list reads when their layers are enabled; they do not import GTFS static rows as a side effect. Static GTFS import or refresh happens only through an explicit Static Sync action, keeping viewport reads fast and predictable even though first-use data loading requires one more user action.
