import {
  checkbox as createCheckbox,
  createdTime as createCreatedTime,
  date as createDate,
  email as createEmail,
  lastEditedTime as createLastEditedTime,
  multiSelect as createMultiSelect,
  number as createNumber,
  phone as createPhone,
  select as createSelect,
  text as createText,
  title as createTitle,
  url as createUrl,
} from "@notion-kit/table-hook/plugins";

import { checkbox } from "./checkbox";
import { createdTime, date, lastEditedTime } from "./date";
import { email, phone, url } from "./link";
import { number } from "./number";
import { createPluginRegistry } from "./registry";
import { multiSelect, select } from "./select";
import { text } from "./text";
import { title } from "./title";

export const DEFAULT_DATA_PLUGINS = [
  createTitle(),
  createText(),
  createNumber(),
  createCheckbox(),
  createSelect(),
  createMultiSelect(),
  createEmail(),
  createPhone(),
  createUrl(),
  createDate(),
  createCreatedTime(),
  createLastEditedTime(),
];

export const DEFAULT_UI_PLUGINS = [
  title(),
  text(),
  number(),
  checkbox(),
  select(),
  multiSelect(),
  email(),
  phone(),
  url(),
  date(),
  createdTime(),
  lastEditedTime(),
];

export const DEFAULT_PLUGINS = createPluginRegistry({
  data: DEFAULT_DATA_PLUGINS,
  ui: DEFAULT_UI_PLUGINS,
});

export type DefaultPlugins = typeof DEFAULT_DATA_PLUGINS;

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
export { DefaultGroupingValue } from "./utils";
export { createPluginRegistry } from "./registry";
export type {
  CellUiProps,
  ConfigMenuProps,
  GroupingValueProps,
  TablePluginPair,
  TablePluginRegistry,
  TableUiPlugin,
} from "./registry";

// TMP export for storybook
export * from "./date/date-cell";
