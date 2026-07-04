import React from "react";
import { tzOffset } from "@date-fns/tz";

import { cn } from "@notion-kit/cn";

import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  MenuItemCheck,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/primitives";

interface TimezoneMenuProps extends React.PropsWithChildren {
  className?: string;
  /**
   * @prop timezone
   * @example Asia/Taipei
   */
  currentTz?: string;
  onChange: (tz: string) => void;
  renderTrigger: (props: { tz: string; gmt: string }) => React.ReactElement;
}

export function TimezoneMenu({
  className,
  currentTz,
  onChange,
  renderTrigger,
}: TimezoneMenuProps) {
  const defaultTz =
    currentTz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezones = React.useMemo(() => Intl.supportedValuesOf("timeZone"), []);
  const timezoneGroups = React.useMemo(
    () => [
      { label: "Current timezone", items: [defaultTz] },
      {
        label: "Select a timezone",
        items: timezones.filter((tz) => tz !== defaultTz),
      },
    ],
    [defaultTz, timezones],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={renderTrigger({ tz: defaultTz, gmt: getGmtStr(defaultTz) })}
      />
      <PopoverContent className={cn("w-[342px]", className)}>
        <Autocomplete<string>
          items={timezoneGroups}
          itemToStringValue={(tz) => tz}
          open
          autoHighlight="always"
          openOnInputClick
        >
          <AutocompleteInput placeholder="Search cities, timezones..." />
          <AutocompleteContent variant="inline">
            <AutocompleteList className="max-h-100">
              {(group: (typeof timezoneGroups)[number]) => (
                <AutocompleteGroup key={group.label} items={group.items}>
                  <AutocompleteLabel title={group.label} />
                  <AutocompleteCollection>
                    {(tz: string) => (
                      <AutocompleteItem
                        key={tz}
                        className="h-11"
                        value={tz}
                        label={tz.replace("_", " ")}
                        desc={getGmtStr(tz)}
                        onClick={() => onChange(tz)}
                      >
                        {tz === defaultTz && <MenuItemCheck />}
                      </AutocompleteItem>
                    )}
                  </AutocompleteCollection>
                </AutocompleteGroup>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </PopoverContent>
    </Popover>
  );
}

function getGmtStr(tz: string): string {
  const num = Math.round(tzOffset(tz, new Date()) / 60);
  return num === 0 ? "GMT" : `GMT${num > 0 ? "+" : ""}${num}:00`;
}
