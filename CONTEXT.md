# Transit Map

This context describes how the map server understands static and realtime transit data for map, route, stop, departure, and replay use cases.

## Language

**GTFS Static Feed**:
A versioned bundle of schedule files from one transit data feed.
_Avoid_: static dataset, GTFS zip

**Feed Onestop ID**:
The canonical feed identifier used to scope imported GTFS static rows in this application.
_Avoid_: city Onestop ID, operator Onestop ID

**Feed Lookup Key**:
The Transitland key discovered from the current map viewport and used to fetch or refresh a GTFS static feed.
_Avoid_: city key

**Feed Version**:
The Transitland version metadata that tells whether an imported GTFS static feed is current.
_Avoid_: DB version

**Static Sync**:
The user-triggered process that discovers a feed from the current bbox, compares feed version state, imports GTFS rows when needed, and returns scoped map data.
_Avoid_: auto-sync

**Static Feed Status Check**:
A read-only check that compares the current bbox/feed lookup against local GTFS static feed state without importing rows.
_Avoid_: sync, fetch, import

**Static Feed Candidate**:
A discovered GTFS static feed option that may be chosen for route or stop list reads.
_Avoid_: city option, operator option

**Selected Feed**:
The feed chosen by the user or by single-candidate auto-selection for scoped route or stop list reads.
_Avoid_: active city, selected operator

**Realtime Vehicle Sync**:
The user-triggered or background process that polls GTFS-RT vehicle data and stores vehicle snapshots.
_Avoid_: region sync, static sync

## Relationships

- A **Feed Lookup Key** resolves to one **Feed Onestop ID**
- A **Feed Onestop ID** owns one current **GTFS Static Feed** in the map server database
- A **GTFS Static Feed** has one **Feed Version**
- A **Static Feed Status Check** returns zero or more **Static Feed Candidates**
- A **Selected Feed** references one **Feed Lookup Key** and one **Feed Onestop ID**
- A **Selected Feed** scopes route and stop list reads by **Feed Onestop ID**
- A **Static Sync** may skip, replace, or later diff rows for one **GTFS Static Feed**
- A **Static Feed Status Check** may recommend a **Static Sync**, but does not fetch or import GTFS static rows
- A **Realtime Vehicle Sync** never fetches or imports a **GTFS Static Feed**

## Example Dialogue

> **Dev:** "When the user enables the Routes layer, should we import static GTFS immediately?"
> **Domain expert:** "No — enabling Routes or Stops performs a Static Feed Status Check and loads cached data. The explicit Static Sync action imports or refreshes the GTFS Static Feed."
>
> **Dev:** "When a bbox returns several feeds, should the frontend pick one automatically?"
> **Domain expert:** "No — show the Static Feed Candidates and let the user choose a Selected Feed before loading routes or stops."

## Flagged Ambiguities

- "city by Onestop ID" was resolved to mean **Feed Onestop ID**, not a city/place or operator Onestop ID.
- "sync region" was ambiguous because it mixed **Static Sync** and **Realtime Vehicle Sync** — resolved: vehicle-layer sync only polls realtime vehicle data, while route/stop static sync handles GTFS static feed import.
- "route/stop feed" was ambiguous because discovery and list reads use different identifiers — resolved: a **Selected Feed** keeps both **Feed Lookup Key** for sync/discovery and **Feed Onestop ID** for list reads.
