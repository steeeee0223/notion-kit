import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { addDays, addMonths, addWeeks } from "date-fns";

import { useInputField } from "@notion-kit/hooks";
import { updateFilterNode } from "@notion-kit/table-hook";
import type {
  FilterGroup,
  FilterRule,
  FilterValue,
} from "@notion-kit/table-hook";
import type { FilterOperandMetadata } from "@notion-kit/table-hook/plugins";
import {
  Badge,
  Calendar,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@notion-kit/ui/primitives";

import { useTableViewCtx } from "@/table-contexts";

import {
  calendarDateKey,
  dateKeyToCalendarDate,
  formatDateValue,
  getOptionNames,
  getRecordNumber,
  getTimeZone,
  omitRuleValue,
  parseDate,
} from "./utils";

export function OperandControl({
  rule,
  root,
}: {
  rule: FilterRule;
  root: FilterGroup;
}) {
  const { table } = useTableViewCtx();
  const property = table
    .getFilterProperties()
    .find(({ id }) => id === rule.propertyId);
  const operator = property
    ? table
        .getColumnPlugin(property.id)
        .filtering?.operators.find(({ id }) => id === rule.operator)
    : undefined;

  if (!property || !operator) return null;

  return (
    <OperandControlContent
      key={`${rule.id}:${rule.operator}:${operandDraftKey(
        rule.value,
        operator.operand,
        property.config,
      )}`}
      rule={rule}
      root={root}
      metadata={operator.operand}
    />
  );
}

function OperandControlContent({
  rule,
  root,
  metadata,
}: {
  rule: FilterRule;
  root: FilterGroup;
  metadata: FilterOperandMetadata;
}) {
  switch (metadata.kind) {
    case "none":
      return null;
    case "option":
      return (
        <OptionOperand rule={rule} root={root} multiple={metadata.multiple} />
      );
    case "date-range":
      return <DateRangeOperand rule={rule} root={root} />;
    case "date":
      return <DateOperand rule={rule} root={root} />;
    case "number":
      return <NumericOperand rule={rule} root={root} />;
    case "relative-date":
      return <RelativeDateOperand rule={rule} root={root} />;
    case "text":
      return <TextOperand rule={rule} root={root} />;
  }
}

export function operandDraftKey(
  value: FilterValue | undefined,
  metadata: FilterOperandMetadata,
  propertyConfig: unknown,
) {
  if (metadata.kind === "date") {
    return getTimeZone(propertyConfig);
  }
  if (metadata.kind === "date-range") {
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
  root,
}: {
  rule: FilterRule;
  root: FilterGroup;
}) {
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const persisted = typeof rule.value === "number" ? rule.value : undefined;
  const authoritative = persisted?.toString() ?? "";
  const { props } = useInputField({
    id: `filter-number-${rule.id}`,
    initialValue: authoritative,
    validate: (value) =>
      !value.trim() || parseNumericDraft(value, false) !== undefined,
    onUpdate: (value) => {
      if (!value.trim()) {
        updateRule(undefined);
        return;
      }
      const number = parseNumericDraft(value, false);
      if (number !== undefined) updateRule(number);
    },
    autoFocus: false,
    restoreInvalidValueOnBlur: true,
    reconcileCommittedValue: true,
  });
  return (
    <Input
      {...props}
      aria-label="Value"
      inputMode="decimal"
      className="min-w-24 flex-1"
    />
  );
}

function RelativeDateOperand({
  rule,
  root,
}: {
  rule: FilterRule;
  root: FilterGroup;
}) {
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const amount = getRecordNumber(rule.value, "amount");
  const unit = getRelativeDateUnit(rule.value);
  const authoritative = amount?.toString() ?? "";
  const { props } = useInputField({
    id: `filter-relative-date-${rule.id}`,
    initialValue: authoritative,
    validate: (value) =>
      !value.trim() || parseNumericDraft(value, true) !== undefined,
    onUpdate: (value) => {
      if (!value.trim()) {
        updateRule(undefined);
        return;
      }
      const nextAmount = parseNumericDraft(value, true);
      if (nextAmount !== undefined) updateRule({ amount: nextAmount, unit });
    },
    autoFocus: false,
    restoreInvalidValueOnBlur: true,
    reconcileCommittedValue: true,
  });

  return (
    <div className="flex min-w-32 flex-1 gap-1">
      <Input
        {...props}
        aria-label="Relative date amount"
        inputMode="numeric"
        className="min-w-16 flex-1"
      />
      <Select
        items={RELATIVE_DATE_UNITS}
        value={unit}
        onValueChange={(nextUnit) => {
          if (nextUnit === null || amount === undefined) return;
          updateRule({ amount, unit: nextUnit });
        }}
      >
        <SelectTrigger
          aria-label="Relative date unit"
          className="w-24 border border-border"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {RELATIVE_DATE_UNITS.map(({ value, label }) => (
              <SelectItem key={value} value={value} label={label} />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

const RELATIVE_DATE_UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

function getRelativeDateUnit(
  value: FilterValue | undefined,
): (typeof RELATIVE_DATE_UNITS)[number]["value"] {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return "day";
  const unit = value.unit;
  return typeof unit === "string" &&
    RELATIVE_DATE_UNITS.some(({ value }) => value === unit)
    ? (unit as (typeof RELATIVE_DATE_UNITS)[number]["value"])
    : "day";
}

function OptionOperand({
  rule,
  root,
  multiple = false,
}: {
  rule: FilterRule;
  root: FilterGroup;
  multiple?: boolean;
}) {
  const { table } = useTableViewCtx();
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const property = table
    .getFilterProperties()
    .find(({ id }) => id === rule.propertyId);
  const options = getOptionNames(property?.config);
  const multipleValue =
    Array.isArray(rule.value) &&
    rule.value.every((value) => typeof value === "string")
      ? rule.value
      : [];
  const singleValue = typeof rule.value === "string" ? rule.value : null;

  if (multiple) {
    return (
      <MultipleOptionOperand
        options={options}
        value={multipleValue}
        onValueChange={(value) => updateRule(value.length ? value : undefined)}
      />
    );
  }

  return (
    <Combobox
      items={optionGroups(options)}
      value={singleValue}
      onValueChange={(value) => {
        if (value !== null) updateRule(value);
      }}
    >
      <ComboboxInput
        aria-label="Value select"
        placeholder="Choose option"
        className="min-w-24 flex-1 rounded-md border border-border px-2 py-1.5"
      />
      <OptionComboboxContent />
    </Combobox>
  );
}

function MultipleOptionOperand({
  options,
  value,
  onValueChange,
}: {
  options: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <Combobox<string, true>
      multiple
      items={optionGroups(options)}
      value={value}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      onValueChange={(nextValue) => {
        onValueChange(nextValue);
        setInputValue("");
      }}
    >
      <ComboboxTrigger
        ref={triggerRef}
        aria-label="Value select"
        className="min-w-24 flex-1 justify-start rounded-md border border-border bg-input px-2 py-1.5 text-primary"
      >
        <ComboboxValue>
          {(selected: string[]) =>
            selected.length ? (
              <>
                <Badge variant="tag">{selected[0]}</Badge>
                {selected.length > 1 && (
                  <Badge variant="tag">+{selected.length - 1}</Badge>
                )}
              </>
            ) : (
              "Choose options"
            )
          }
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent anchor={triggerRef} className="w-72 p-2">
        <div className="relative">
          <ComboboxChips hideClearButton className="pr-9">
            <ComboboxValue>
              {(selected: string[]) => (
                <>
                  {selected.map((name) => (
                    <ComboboxChip key={name}>{name}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    aria-label="Search options"
                    placeholder="Search options"
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxClear
            aria-label="Clear selected options"
            className="absolute top-1/2 right-1 -translate-y-1/2"
          />
        </div>
        <OptionComboboxList />
      </ComboboxContent>
    </Combobox>
  );
}

function OptionComboboxContent() {
  return (
    <ComboboxContent className="p-1">
      <OptionComboboxList />
    </ComboboxContent>
  );
}

function OptionComboboxList() {
  return (
    <ComboboxList>
      {(group: OptionGroup) => (
        <ComboboxGroup key={group.label} items={group.items}>
          <ComboboxCollection>
            {(name: string) => <ComboboxItem key={name} value={name} />}
          </ComboboxCollection>
        </ComboboxGroup>
      )}
    </ComboboxList>
  );
}

interface OptionGroup {
  label: string;
  items: string[];
}

function optionGroups(options: string[]): OptionGroup[] {
  return [{ label: "Options", items: options }];
}

function TextOperand({ rule, root }: { rule: FilterRule; root: FilterGroup }) {
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const { props } = useInputField({
    id: `filter-text-${rule.id}`,
    initialValue: typeof rule.value === "string" ? rule.value : "",
    onUpdate: (value) => updateRule(value),
    autoFocus: false,
    reconcileCommittedValue: true,
  });

  return <Input {...props} aria-label="Value" className="min-w-24 flex-1" />;
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

function DateOperand({ rule, root }: { rule: FilterRule; root: FilterGroup }) {
  const { table } = useTableViewCtx();
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const property = table
    .getFilterProperties()
    .find(({ id }) => id === rule.propertyId);
  const timeZone = getTimeZone(property?.config);
  const [preset, setPreset] = useState<DatePreset | null>(
    getDatePreset(rule.value),
  );

  return (
    <div className="flex min-w-24 flex-1 gap-1">
      <Select
        items={DATE_PRESETS}
        value={preset}
        onValueChange={(nextPreset) => {
          if (nextPreset === null) return;
          setPreset(nextPreset);
          if (nextPreset === "custom") return;
          const timestamp = getPresetTimestamp(nextPreset, timeZone);
          if (timestamp !== undefined) {
            updateRule({ timestamp, preset: nextPreset });
          }
        }}
      >
        <SelectTrigger
          aria-label="Date preset select"
          className="w-32 border border-border"
        >
          <SelectValue placeholder="Select date" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {DATE_PRESETS.map(({ value, label }) => (
              <SelectItem key={value} value={value} label={label} />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {preset === "custom" && (
        <CustomDateOperand
          value={getRecordNumber(rule.value, "timestamp")}
          timeZone={timeZone}
          onValueChange={(timestamp) =>
            updateRule(timestamp === undefined ? undefined : { timestamp })
          }
        />
      )}
    </div>
  );
}

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "yesterday", label: "Yesterday" },
  { value: "one-week-ago", label: "One week ago" },
  { value: "one-week-from-now", label: "One week from now" },
  { value: "one-month-ago", label: "One month ago" },
  { value: "one-month-from-now", label: "One month from now" },
  { value: "custom", label: "Custom date" },
] as const;

type DatePreset = (typeof DATE_PRESETS)[number]["value"];

function getDatePreset(value: FilterValue | undefined): DatePreset | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const preset = value.preset;
  return typeof preset === "string" &&
    DATE_PRESETS.some(({ value }) => value === preset)
    ? (preset as DatePreset)
    : getRecordNumber(value, "timestamp") === undefined
      ? null
      : "custom";
}

function getPresetTimestamp(
  preset: Exclude<DatePreset, "custom">,
  timeZone: string,
) {
  const today = dateKeyToCalendarDate(formatDateValue(Date.now(), timeZone));
  if (!today) return undefined;
  const date =
    preset === "tomorrow"
      ? addDays(today, 1)
      : preset === "yesterday"
        ? addDays(today, -1)
        : preset === "one-week-ago"
          ? addWeeks(today, -1)
          : preset === "one-week-from-now"
            ? addWeeks(today, 1)
            : preset === "one-month-ago"
              ? addMonths(today, -1)
              : preset === "one-month-from-now"
                ? addMonths(today, 1)
                : today;
  return parseDate(calendarDateKey(date), timeZone);
}

function CustomDateOperand({
  value,
  timeZone,
  onValueChange,
}: {
  value: number | undefined;
  timeZone: string;
  onValueChange: (value: number | undefined) => void;
}) {
  const authoritative = formatDateValue(value, timeZone);
  const [open, setOpen] = useState(false);
  const { props } = useInputField({
    id: "filter-custom-date",
    initialValue: authoritative,
    validate: (value) => !value || parseDate(value, timeZone) !== undefined,
    onUpdate: (value) => {
      if (!value) {
        onValueChange(undefined);
        return;
      }
      const timestamp = parseDate(value, timeZone);
      if (timestamp !== undefined) onValueChange(timestamp);
    },
    autoFocus: false,
    restoreInvalidValueOnBlur: true,
    reconcileCommittedValue: true,
  });

  return (
    <div className="relative min-w-32 flex-1">
      <Input
        {...props}
        aria-label="Custom date select"
        placeholder="YYYY-MM-DD"
        onClick={() => setOpen(true)}
        className="min-w-32 flex-1 rounded-md border border-border px-2 py-1.5"
      />
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-fit rounded-md border border-border bg-popover shadow-md">
          <Calendar
            mode="single"
            selected={dateKeyToCalendarDate(authoritative)}
            onSelect={(date) => {
              if (!date) return;
              const nextValue = calendarDateKey(date);
              const timestamp = parseDate(nextValue, timeZone);
              if (timestamp === undefined) return;
              onValueChange(timestamp);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function DateRangeOperand({
  rule,
  root,
}: {
  rule: FilterRule;
  root: FilterGroup;
}) {
  const { table } = useTableViewCtx();
  const updateRule = useFilterRuleUpdate(root, rule.id);
  const property = table
    .getFilterProperties()
    .find(({ id }) => id === rule.propertyId);
  const timeZone = getTimeZone(property?.config);
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
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const restore = () => {
    setStart(authoritativeStart);
    setEnd(authoritativeEnd);
    setSelectingEnd(false);
  };
  const commit = (nextStart: string, nextEnd: string) => {
    if (nextStart === authoritativeStart && nextEnd === authoritativeEnd) {
      return;
    }
    if (!nextStart && !nextEnd) {
      if (authoritativeStart || authoritativeEnd) updateRule(undefined);
      restore();
      return;
    }
    const startTimestamp = parseDate(nextStart, timeZone);
    const endTimestamp = parseDate(nextEnd, timeZone);
    if (
      startTimestamp === undefined ||
      endTimestamp === undefined ||
      startTimestamp > endTimestamp
    ) {
      restore();
      return;
    }
    updateRule({ start: startTimestamp, end: endTimestamp });
    restore();
  };
  const commitDraft = () => commit(start, end);
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter") commitDraft();
  };
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (
      event.relatedTarget === startRef.current ||
      event.relatedTarget === endRef.current
    ) {
      return;
    }
    commitDraft();
  };
  return (
    <div className="relative min-w-40 flex-1">
      <Input
        aria-label="Date range select"
        placeholder="Select a range"
        value={start && end ? `${start} → ${end}` : ""}
        readOnly
        onClick={() => setOpen(true)}
        className="min-w-40 rounded-md border border-border px-2 py-1.5"
      />
      {open && (
        <div className="absolute left-0 z-50 mt-2 w-fit rounded-md border border-border bg-popover p-2 shadow-md">
          <div className="flex flex-col gap-2">
            <Input
              ref={startRef}
              aria-label="Starting"
              placeholder="Starting"
              value={start}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setStart(next);
                setSelectingEnd(false);
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
            <Input
              ref={endRef}
              aria-label="Ending"
              placeholder="Ending"
              value={end}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setEnd(next);
                setSelectingEnd(false);
              }}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Calendar
            mode="range"
            selected={{
              from: dateKeyToCalendarDate(start),
              to: dateKeyToCalendarDate(end),
            }}
            onSelect={(range) => {
              const nextStart = range?.from ? calendarDateKey(range.from) : "";
              const nextEnd = range?.to ? calendarDateKey(range.to) : "";
              if (!nextStart) {
                setStart("");
                setEnd("");
                setSelectingEnd(false);
                updateRule(undefined);
                return;
              }
              if (!selectingEnd) {
                setStart(nextStart);
                setEnd("");
                setSelectingEnd(true);
                return;
              }
              setStart(nextStart);
              setEnd(nextEnd);
              setSelectingEnd(false);
              if (nextEnd) commit(nextStart, nextEnd);
            }}
          />
        </div>
      )}
    </div>
  );
}

function useFilterRuleUpdate(root: FilterGroup, ruleId: string) {
  const { table } = useTableViewCtx();

  return (value: FilterValue | undefined) =>
    table.setFilters(
      updateFilterNode(root, ruleId, (node) => {
        if (node.kind !== "rule") return node;
        return value === undefined ? omitRuleValue(node) : { ...node, value };
      }),
    );
}
