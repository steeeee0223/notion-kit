"use client";

import { useEffect, useState } from "react";
import type { OnChangeFn } from "@tanstack/react-table";
import z from "zod/v4";

import { cn } from "@notion-kit/cn";
import { Input, Separator } from "@notion-kit/ui/primitives";
import { formatDate, isoToTs } from "@notion-kit/utils";

import type { DateData } from "../types";

const dateTimeSchema = z.object({
  date: z.iso.date().or(z.literal("")),
  time: z.iso.time({ precision: 0 }).or(z.literal("")).default("00:00:00"),
});
type DateTimeSchema = z.infer<typeof dateTimeSchema>;

function parsedDateTimeToTs(value: DateTimeSchema, tz?: string) {
  return isoToTs(
    { ...value, time: value.time || "00:00:00" },
    tz,
  );
}

interface DateRangeInputProps {
  className?: string;
  value: DateData;
  onChange: OnChangeFn<DateData>;
  tz?: string;
}

export function DateRangeInput({
  className,
  value,
  onChange,
  tz,
}: DateRangeInputProps) {
  return (
    <div
      data-slot="date-range"
      className={cn("flex flex-col gap-2 p-2", className)}
    >
      {value.includeTime ? (
        <>
          <DateTimeInput
            id="start"
            value={value.start}
            tz={tz}
            onChange={(ts) => onChange((v) => ({ ...v, start: ts }))}
          />
          {value.endDate && (
            <DateTimeInput
              id="end"
              value={value.end}
              tz={tz}
              onChange={(ts) => onChange((v) => ({ ...v, end: ts }))}
            />
          )}
        </>
      ) : (
        <div className="flex gap-3">
          <DateInput
            id="start"
            value={value.start}
            tz={tz}
            onChange={(ts) => onChange((prev) => ({ ...prev, start: ts }))}
          />
          {value.endDate && (
            <DateInput
              id="end"
              value={value.end}
              tz={tz}
              onChange={(ts) => onChange((prev) => ({ ...prev, end: ts }))}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface DateTimeInputProps {
  id: string;
  value?: number; // timestamp in ms
  onChange: (ts: number) => void;
  tz?: string;
}

function DateTimeInput({ id, value: ts, onChange, tz }: DateTimeInputProps) {
  const [error, setError] = useState(false);
  const getValue = (): DateTimeSchema => {
    if (ts === undefined || ts < 0) return { date: "", time: "" };
    const [date, time] = formatDate(ts, {
      dateFormat: "_edit_mode",
      timeFormat: "_edit_mode",
    }).split(" ");
    return { date: date!, time: time! };
  };
  const [value, setValue] = useState<DateTimeSchema>(getValue);
  useEffect(() => setValue(getValue()), [ts]);
  const handleBlur = () => {
    const res = dateTimeSchema.safeParse(value);
    setError(!res.success);
    onChange(res.success ? parsedDateTimeToTs(res.data, tz) : -1);
  };

  return (
    <div
      data-slot="date-time-input"
      className={cn(
        "flex h-7 grow basis-1/2 items-center rounded-sm bg-input px-2 text-sm/tight ring-inset focus-within:shadow-notion",
        error ? "bg-red/15 ring-2 ring-red" : "ring-1 ring-ring",
      )}
    >
      <Input
        id={`${id}:date`}
        variant="flat"
        className="p-0"
        value={value.date}
        onChange={(e) => setValue((v) => ({ ...v, date: e.target.value }))}
        onFocus={() => setError(false)}
        onBlur={handleBlur}
      />
      <Separator
        orientation="vertical"
        className="mx-3 data-[orientation=vertical]:h-3.5"
      />
      <Input
        id={`${id}:time`}
        variant="flat"
        className="p-0"
        value={value.time}
        onChange={(e) => setValue((v) => ({ ...v, time: e.target.value }))}
        onFocus={() => setError(false)}
        onBlur={handleBlur}
      />
    </div>
  );
}

interface DateInputProps {
  id: string;
  value?: number; // timestamp in ms
  onChange: (ts: number) => void;
  tz?: string;
}

function DateInput({ id, value: ts, onChange, tz }: DateInputProps) {
  const [error, setError] = useState(false);
  const getValue = () => {
    if (ts === undefined || ts < 0) return "";
    return formatDate(ts, {
      dateFormat: "_edit_mode",
      timeFormat: "hidden",
    });
  };
  const [value, setValue] = useState(getValue);
  useEffect(() => setValue(getValue()), [ts]);

  const handleBlur = () => {
    const res = dateTimeSchema.safeParse({ date: value, time: "" });
    setError(!res.success);
    onChange(res.success ? parsedDateTimeToTs(res.data, tz) : -1);
  };

  return (
    <Input
      id={id}
      className="px-2"
      aria-invalid={error}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setError(false)}
      onBlur={handleBlur}
    />
  );
}
