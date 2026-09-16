import { createContext, use, useMemo } from "react";
import { useDraggable } from "@dnd-kit/react";
import { format } from "date-fns";

import { cn } from "@notion-kit/cn";

import { Button, composeRefs, type ButtonProps } from "@/primitives";

import { useCalendarContext } from "./calendar-context";
import { zonedDate } from "./date-utils";
import type { CalendarEventRenderer, CalendarEventRenderProps } from "./types";

const EventContext = createContext<CalendarEventRenderProps | null>(null);
function useEvent() {
  const value = use(EventContext);
  if (!value) throw new Error("CalendarEvent parts require CalendarEvent.Root");
  return value;
}
export interface CalendarEventRootProps
  extends CalendarEventRenderProps,
    React.ComponentProps<"div"> {}
function Root({
  event,
  segment,
  className,
  children,
  ...props
}: CalendarEventRootProps) {
  const calendar = useCalendarContext();
  const value = useMemo(() => ({ event, segment }), [event, segment]);
  return (
    <EventContext value={value}>
      <div
        {...props}
        data-slot="calendar-event"
        data-event-id={event.id}
        data-segment-day={segment.day}
        data-dragging={calendar.draft?.id === event.id || undefined}
        className={cn(
          "group relative size-full min-w-0 rounded-md border bg-main shadow-sm",
          calendar.draft?.id === event.id && "opacity-40",
          className,
        )}
      >
        {children}
      </div>
    </EventContext>
  );
}
export type CalendarEventItemProps = Omit<ButtonProps, "render">;
function Item({
  className,
  children,
  onClick,
  ref,
  ...props
}: CalendarEventItemProps) {
  const { event, segment } = useEvent();
  const calendar = useCalendarContext();
  const draggable = useDraggable({
    id: `${segment.key}:move`,
    disabled: !calendar.canChange,
    register: calendar.canChange,
    data: { eventId: event.id, segmentDay: segment.day, reason: "move" },
  });
  return (
    <Button
      {...props}
      ref={composeRefs(ref, draggable.ref, draggable.handleRef)}
      variant={null}
      aria-label={event.name || "Untitled event"}
      data-slot="calendar-event-item"
      title={`${event.name} — ${format(zonedDate(event.startAt, calendar.timeZone), "MMM d, HH:mm xxx")}`}
      className={cn(
        "flex size-full min-w-0 items-start justify-start overflow-hidden rounded-md px-2 py-1 text-start text-xs",
        calendar.canChange && "cursor-grab touch-none active:cursor-grabbing",
        className,
      )}
      onClick={(click) => {
        click.stopPropagation();
        if (calendar.suppressClick.current) {
          click.preventDefault();
          return;
        }
        onClick?.(click);
        if (!click.defaultPrevented) calendar.onEventClick?.(event);
      }}
    >
      <span className="min-w-0 truncate">
        {children ?? (
          <>
            {!event.allDay && (
              <span className="me-1 text-secondary">
                {format(zonedDate(event.startAt, calendar.timeZone), "HH:mm")}
              </span>
            )}
            {event.name || "Untitled"}
          </>
        )}
      </span>
    </Button>
  );
}
export interface CalendarEventResizeProps extends Omit<ButtonProps, "render"> {
  edge: "start" | "end";
}
function Resize({ edge, className, ref, ...props }: CalendarEventResizeProps) {
  const { event, segment } = useEvent();
  const calendar = useCalendarContext();
  const enabled =
    calendar.canChange && (edge === "start" ? segment.isStart : segment.isEnd);
  const draggable = useDraggable({
    id: `${segment.key}:resize-${edge}`,
    disabled: !enabled,
    register: enabled,
    data: {
      eventId: event.id,
      segmentDay: segment.day,
      reason: `resize-${edge}`,
    },
  });
  if (!enabled) return null;
  return (
    <Button
      {...props}
      ref={composeRefs(ref, draggable.ref, draggable.handleRef)}
      variant={null}
      aria-label={`Resize ${edge}`}
      data-slot="calendar-event-resize"
      data-edge={edge}
      className={cn(
        "absolute z-10 touch-none opacity-0 group-hover:opacity-100 focus:opacity-100",
        segment.area === "time"
          ? "inset-x-1 h-2 cursor-row-resize"
          : "inset-y-0 w-2 cursor-col-resize",
        segment.area === "time"
          ? edge === "start"
            ? "top-0"
            : "bottom-0"
          : edge === "start"
            ? "inset-s-0"
            : "inset-e-0",
        className,
      )}
      onClick={(click) => {
        click.preventDefault();
        click.stopPropagation();
      }}
    />
  );
}
export const CalendarEvent = { Root, Item, Resize };
export function DefaultCalendarEvent(props: CalendarEventRenderProps) {
  return (
    <Root {...props}>
      <Item />
      <Resize edge="start" />
      <Resize edge="end" />
    </Root>
  );
}
export function CalendarEventContent({
  renderEvent = DefaultCalendarEvent,
  ...props
}: CalendarEventRenderProps & { renderEvent?: CalendarEventRenderer }) {
  const calendar = useCalendarContext();
  if (props.event === calendar.draft)
    return (
      <div
        data-slot="calendar-event-preview"
        aria-hidden
        className="pointer-events-none size-full truncate rounded-md border border-primary bg-main px-2 py-1 text-xs shadow-md"
      >
        {props.event.name}
      </div>
    );
  return renderEvent(props);
}
