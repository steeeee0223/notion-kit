import { useState } from "react";

import type { DateConfig, DateData } from "@notion-kit/table-hook/plugins";
import { DateTimePicker } from "@notion-kit/table-view";
import { Calendar, type DateRange } from "@notion-kit/ui/primitives";

export function BasicExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow-sm"
      captionLayout="dropdown"
    />
  );
}

export function RangeCalendarExample() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 6, 15),
  });

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      className="rounded-lg border shadow-sm"
    />
  );
}

export function EnhancedDateTimePickerExample() {
  const [data, setData] = useState<DateData>({});
  const [config, setConfig] = useState<DateConfig>({
    dateFormat: "full",
    timeFormat: "12-hour",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return (
    <DateTimePicker
      data={data}
      config={config}
      onChange={setData}
      onConfigChange={setConfig}
    />
  );
}
