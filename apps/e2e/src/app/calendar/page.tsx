"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CalendarContent,
  CalendarHeaderToolbar,
  CalendarProvider,
  type CalendarEventChange,
  type CalendarRange,
} from "@notion-kit/ui/calendar";
import { Button, TooltipProvider } from "@notion-kit/ui/primitives";

import {
  CALENDAR_ANCHOR,
  createCalendarEvents,
  createDstCalendarEvents,
} from "../../test-fixtures/calendar";

function CalendarFixture() {
  const searchParams = useSearchParams();
  const initialRange = searchParams.get("range");
  const [events, setEvents] = useState(createCalendarEvents);
  const [range, setRange] = useState<CalendarRange>(
    initialRange === "week"
      ? "weekly"
      : initialRange === "day"
        ? "daily"
        : "monthly",
  );
  const [anchorDate, setAnchorDate] = useState(CALENDAR_ANCHOR);
  const [timeZone, setTimeZone] = useState("UTC");
  const [rejectChanges, setRejectChanges] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);
  const [createCount, setCreateCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [lastChange, setLastChange] = useState<CalendarEventChange | null>(
    null,
  );
  const [openedId, setOpenedId] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-main p-4 text-primary">
        <header className="mb-4 flex flex-wrap items-center gap-2">
          <h1 className="me-auto text-xl font-semibold">
            Calendar browser fixture
          </h1>
          <Button
            onClick={() => setRejectChanges((value) => !value)}
            aria-pressed={rejectChanges}
          >
            Reject event changes
          </Button>
          <Button
            onClick={() => setReadOnly((value) => !value)}
            aria-pressed={readOnly}
          >
            Read only
          </Button>
          <Button
            aria-pressed={dark}
            onClick={() => setDark((value) => !value)}
          >
            Dark mode
          </Button>
          <Button
            onClick={() => {
              setEvents(createDstCalendarEvents());
              setAnchorDate(Date.parse("2026-11-01T12:00Z"));
              setTimeZone("America/New_York");
              setRange("weekly");
            }}
          >
            Show DST week
          </Button>
        </header>
        <div className="h-140 min-w-0">
          <CalendarProvider
            events={events}
            range={range}
            onRangeChange={setRange}
            anchorDate={anchorDate}
            onAnchorDateChange={setAnchorDate}
            timeZone={timeZone}
            readOnly={readOnly}
            onCreate={(value) => {
              setCreateCount((count) => count + 1);
              if (!rejectChanges)
                setEvents((current) => [
                  ...current,
                  { ...value, id: crypto.randomUUID(), name: "New event" },
                ]);
            }}
            onEventClick={(event) => {
              setOpenCount((count) => count + 1);
              setOpenedId(event.id);
            }}
            onEventChange={(change) => {
              setChangeCount((count) => count + 1);
              setLastChange(change);
              if (!rejectChanges)
                setEvents((current) =>
                  current.map((event) =>
                    event.id === change.id
                      ? {
                          ...event,
                          startAt: change.startAt,
                          endAt: change.endAt,
                          allDay: change.allDay,
                        }
                      : event,
                  ),
                );
            }}
          >
            <CalendarHeaderToolbar />
            <CalendarContent />
          </CalendarProvider>
        </div>
        <section aria-label="Calendar owner state" className="pt-4">
          <pre data-testid="calendar-state">
            {JSON.stringify({
              events,
              range,
              anchorDate,
              timeZone,
              createCount,
              changeCount,
              openCount,
              lastChange,
              openedId,
            })}
          </pre>
        </section>
      </main>
    </TooltipProvider>
  );
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarFixture />
    </Suspense>
  );
}
