import { useState } from "react";

import { Icon } from "@notion-kit/icons";
import type { FilterRule, FilterValue } from "@notion-kit/table-hook";
import type { FilterOperandMetadata } from "@notion-kit/table-hook/plugins";
import {
  Button,
  Calendar,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import type { FilterProperty } from "./types";
import {
  calendarDateKey,
  dateKeyToCalendarDate,
  formatDateValue,
  getOptionNames,
  getRecordNumber,
  getTimeZone,
  parseDate,
} from "./utils";

export function OperandControl({
  rule,
  metadata,
  property,
  onChange,
}: {
  rule: FilterRule;
  metadata: FilterOperandMetadata;
  property: FilterProperty;
  onChange: (value: FilterValue | undefined) => void;
}) {
  switch (metadata.kind) {
    case "none":
      return null;
    case "option": {
      const options = getOptionNames(property.config);
      const items = options.map((name) => ({ value: name, label: name }));
      const current = typeof rule.value === "string" ? rule.value : null;
      return (
        <Select
          items={items}
          value={current}
          onValueChange={(value) => value !== null && onChange(value)}
        >
          <SelectTrigger
            aria-label="Value select"
            className="min-w-24 flex-1 border border-border"
          >
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((name) => (
                <SelectItem key={name} value={name} label={name} />
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
    case "date-range":
      return (
        <DateRangeOperand
          rule={rule}
          timeZone={getTimeZone(property.config)}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <DateOperand
          rule={rule}
          timeZone={getTimeZone(property.config)}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <NumericOperand rule={rule} relative={false} onChange={onChange} />
      );
    case "relative-date":
      return <NumericOperand rule={rule} relative onChange={onChange} />;
    case "text":
      return (
        <Input
          aria-label="Value"
          value={typeof rule.value === "string" ? rule.value : ""}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="min-w-24 flex-1"
        />
      );
  }
}

export function operandDraftKey(
  value: FilterValue | undefined,
  metadata: FilterOperandMetadata,
  propertyConfig: unknown,
) {
  if (metadata.kind === "date" || metadata.kind === "date-range") {
    return `${JSON.stringify(value)}:${getTimeZone(propertyConfig)}`;
  }
  return metadata.kind === "text" ||
    metadata.kind === "number" ||
    metadata.kind === "relative-date"
    ? "controlled"
    : JSON.stringify(value);
}

function NumericOperand({
  rule,
  relative,
  onChange,
}: {
  rule: FilterRule;
  relative: boolean;
  onChange: (value: FilterValue | undefined) => void;
}) {
  const persisted = relative
    ? getRecordNumber(rule.value, "offsetDays")
    : typeof rule.value === "number"
      ? rule.value
      : undefined;
  const authoritative = persisted?.toString() ?? "";
  const [draft, setDraft] = useState<{
    value: string;
    base: string;
  } | null>(null);
  const parsedDraft = draft
    ? parseNumericDraft(draft.value, relative)
    : undefined;
  const draftIsEmpty = draft?.value.trim() === "";
  const preservePartialDraft =
    draft !== null &&
    !draftIsEmpty &&
    parsedDraft === undefined &&
    draft.base === authoritative;
  const displayValue = preservePartialDraft ? draft.value : authoritative;
  return (
    <Input
      aria-label="Value"
      inputMode={relative ? "numeric" : "decimal"}
      value={displayValue}
      onChange={(event) => {
        const next = event.currentTarget.value;
        setDraft({ value: next, base: authoritative });
        if (!next.trim()) {
          onChange(undefined);
          return;
        }
        const number = parseNumericDraft(next, relative);
        if (number !== undefined) {
          onChange(relative ? { offsetDays: number } : number);
        }
      }}
      onBlur={() => setDraft(null)}
      className="min-w-24 flex-1"
    />
  );
}

function parseNumericDraft(value: string, relative: boolean) {
  const pattern = relative
    ? /^[+-]?\d+$/
    : /^[+-]?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/;
  if (!pattern.test(value)) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  if (relative && !Number.isSafeInteger(number)) return undefined;
  return number;
}

function DateOperand({
  rule,
  timeZone,
  onChange,
}: {
  rule: FilterRule;
  timeZone: string;
  onChange: (value: FilterValue | undefined) => void;
}) {
  const timestamp = getRecordNumber(rule.value, "timestamp");
  const authoritative = formatDateValue(timestamp, timeZone);
  const [draft, setDraft] = useState(authoritative);
  const selectDate = (date: Date | undefined) => {
    if (!date) return;
    const next = calendarDateKey(date);
    const nextTimestamp = parseDate(next, timeZone);
    if (nextTimestamp !== undefined) onChange({ timestamp: nextTimestamp });
  };
  return (
    <div className="flex min-w-24 flex-1 gap-1">
      <Input
        aria-label="Value"
        placeholder="YYYY-MM-DD"
        value={draft}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setDraft(next);
          if (!next) {
            onChange(undefined);
            return;
          }
          const nextTimestamp = parseDate(next, timeZone);
          if (nextTimestamp !== undefined) {
            onChange({ timestamp: nextTimestamp });
            setDraft(authoritative);
          }
        }}
        onBlur={() => {
          if (parseDate(draft, timeZone) === undefined) setDraft(authoritative);
        }}
      />
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="hint" size="circle" aria-label="Open calendar">
              <Icon.ViewCalendar className="size-4" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateKeyToCalendarDate(authoritative)}
            onSelect={selectDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DateRangeOperand({
  rule,
  timeZone,
  onChange,
}: {
  rule: FilterRule;
  timeZone: string;
  onChange: (value: FilterValue | undefined) => void;
}) {
  const authoritativeStart = formatDateValue(
    getRecordNumber(rule.value, "start"),
    timeZone,
  );
  const authoritativeEnd = formatDateValue(
    getRecordNumber(rule.value, "end"),
    timeZone,
  );
  const [start, setStart] = useState(authoritativeStart);
  const [end, setEnd] = useState(authoritativeEnd);
  const commit = (nextStart: string, nextEnd: string) => {
    if ((!nextStart || !nextEnd) && authoritativeStart && authoritativeEnd) {
      onChange(undefined);
      return;
    }
    const startTimestamp = parseDate(nextStart, timeZone);
    const endTimestamp = parseDate(nextEnd, timeZone);
    if (
      startTimestamp !== undefined &&
      endTimestamp !== undefined &&
      startTimestamp <= endTimestamp
    ) {
      onChange({ start: startTimestamp, end: endTimestamp });
      setStart(authoritativeStart);
      setEnd(authoritativeEnd);
    }
  };
  return (
    <div className="flex min-w-32 flex-1 gap-1">
      <Input
        aria-label="Start"
        placeholder="YYYY-MM-DD"
        value={start}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setStart(next);
          commit(next, end);
        }}
        onBlur={() => {
          if (start && parseDate(start, timeZone) === undefined) {
            setStart(authoritativeStart);
          }
        }}
      />
      <CalendarButton
        label="Open start calendar"
        selected={start}
        onSelect={(date) => {
          const next = calendarDateKey(date);
          setStart(next);
          commit(next, end);
        }}
      />
      <Input
        aria-label="End"
        placeholder="YYYY-MM-DD"
        value={end}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setEnd(next);
          commit(start, next);
        }}
        onBlur={() => {
          if (end && parseDate(end, timeZone) === undefined) {
            setEnd(authoritativeEnd);
          }
        }}
      />
      <CalendarButton
        label="Open end calendar"
        selected={end}
        onSelect={(date) => {
          const next = calendarDateKey(date);
          setEnd(next);
          commit(start, next);
        }}
      />
    </div>
  );
}

function CalendarButton({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: string;
  onSelect: (date: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="hint" size="circle" aria-label={label}>
            <Icon.ViewCalendar className="size-4" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateKeyToCalendarDate(selected)}
          onSelect={(date) => {
            if (date) onSelect(date);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
