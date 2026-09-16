# Calendar test suite design

Designed before implementation on 2026-09-16. Scope: the approved Calendar design and C01–C30 plan. Each behavior has one primary test owner; integration tests add boundary evidence, not repetitions of date arithmetic.

| Owner | Suite | Failure it must catch |
| --- | --- | --- |
| UI dates | calendar/date-utils | Invalid event poisons remaining events; null end becomes persisted; DST day uses 24 hours; invalid zone crashes; ambiguous/nonexistent wall time maps incorrectly |
| UI layout | month-layout, time-grid-layout | Missing month weeks; incorrect midnight inclusion; overlapping lanes; clipped edges get resize handles; repeated/short visual events cover each other |
| UI transforms | event-transforms | Grabbed segment changes start incorrectly; null end materialized on move; resize crosses minimum; conversion adds an extra midnight day |
| UI interaction | calendar-components, calendar-drag | Controlled navigation rejected but retained locally; inaccessible create/open; missing callbacks allow edits; cancelled or stale gestures write; commit repeats; drag opens event |
| Table resources | existing resource-api and row suites | Layout/range fallback splits writes or callbacks loop; owner rejection ignored; consecutive create loses first proposal; initial date requires a second write |
| Table adapter | calendar-adapter | Invalid or disabled ends displayed; inclusive all-day boundary converted incorrectly; write drops cell metadata |
| Table integration | date-view-navigation, Calendar content/actions | Navigation persists or leaks across instances; collapsed grouping hides rows; Calendar seeds empty dates; row opens before owner accepts; changes reorder sorted rows |
| Timeline | existing provider/utils plus anchor cases | External anchor not positioned; sidebar shifts reported date; last scroll is lost before unmount; programmatic scroll echoes; range change drifts |
| Browser | calendar, calendar-table-view, existing timeline | Real hit testing, segment offset, resize/conversion, auto-scroll, sticky/overflow, and controlled resource payload differ from modeled behavior |

Existing Timeline regression suites are migrated, not cloned. Private date controls use existing consumer coverage; no tests for trivial forwarding components. Parameterized cases share setup where outcomes represent the same contract. Browser assertions use hand-checked timestamps and resource values. Specs import test/expect from ./fixtures and interactions live in component objects.

Names follow TestUnit_Scenario_ExpectedOutcome for new suites. Reuse existing component objects. No snapshot-only tests, source-text tests, generated-constant checks, or expectations computed by the implementation under test.

Verification order: focused red/green tests; package tests/typecheck/lint/build; browser and visual evidence; then record only proven results in todo.md.
