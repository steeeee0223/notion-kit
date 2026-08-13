import { checkbox } from "./checkbox";
import {
  createdTime,
  date,
  extractCreatedTime,
  extractDateValue,
  extractLastEditedTime,
  lastEditedTime,
  withDateCalculations,
} from "./date";
import type { DateData } from "./date";
import { email, phone, url } from "./link";
import { number, withNumberCalculations } from "./number";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";
import { withCheckboxCounting, withGenericCounting } from "./utils";

export const DEFAULT_PLUGINS = [
  withGenericCounting(title()),
  withGenericCounting(text()),
  (() => {
    const plugin = withGenericCounting(number());
    return { ...plugin, counting: withNumberCalculations(plugin.counting) };
  })(),
  withCheckboxCounting(checkbox()),
  withGenericCounting(select()),
  withGenericCounting(multiSelect()),
  withGenericCounting(email()),
  withGenericCounting(phone()),
  withGenericCounting(url()),
  (() => {
    const plugin = withGenericCounting(date());
    return {
      ...plugin,
      counting: withDateCalculations<DateData>(
        plugin.counting,
        extractDateValue,
      ),
    };
  })(),
  (() => {
    const plugin = withGenericCounting(createdTime());
    return {
      ...plugin,
      counting: withDateCalculations(plugin.counting, extractCreatedTime, true),
    };
  })(),
  (() => {
    const plugin = withGenericCounting(lastEditedTime());
    return {
      ...plugin,
      counting: withDateCalculations(
        plugin.counting,
        extractLastEditedTime,
        true,
      ),
    };
  })(),
];

export type DefaultPlugins = (typeof DEFAULT_PLUGINS)[number][];

export {
  title,
  text,
  checkbox,
  select,
  multiSelect,
  number,
  email,
  phone,
  url,
  date,
  createdTime,
  lastEditedTime,
};
export type * from "./types";
export type * from "./date/types";
export type * from "./number/types";
export type * from "./select/types";
export * from "./utils";

// TMP export for storybook
export * from "./date/date-cell";
