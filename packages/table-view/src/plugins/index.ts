import { checkbox } from "./checkbox";
import { createdTime, date, lastEditedTime } from "./date";
import { email, phone, url } from "./link";
import { number } from "./number";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";
import { withCheckboxCounting, withGenericCounting } from "./utils";

export const DEFAULT_PLUGINS = [
  withGenericCounting(title()),
  withGenericCounting(text()),
  withGenericCounting(number()),
  withCheckboxCounting(checkbox()),
  withGenericCounting(select()),
  withGenericCounting(multiSelect()),
  withGenericCounting(email()),
  withGenericCounting(phone()),
  withGenericCounting(url()),
  withGenericCounting(date()),
  withGenericCounting(createdTime()),
  withGenericCounting(lastEditedTime()),
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
